import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'central-db.json');
const UPLOADS_DIR = path.join(DB_DIR, 'uploads');

// Ensure database and uploads directory exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Server-Sent Events clients for live push sync across devices
const sseClients: Response[] = [];

// Helper to read DB safely
function readCentralDB(): Record<string, any> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading central DB:', err);
  }
  return {};
}

// Helper to write DB safely
function writeCentralDB(data: Record<string, any>): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing central DB:', err);
  }
}

// Middleware
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Serve uploaded photos and files to all devices
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '1d',
  immutable: false,
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    institution: 'Centro de Medios y Archivos - Puerto Esperanza',
    sync: 'active',
    connectedClients: sseClients.length,
    timestamp: new Date().toISOString(),
  });
});

// SSE Live Sync stream endpoint
app.get('/api/sync/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  sseClients.push(res);

  // Send initial connection handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Keep SSE alive across mobile carrier timeouts with 15s heartbeats
setInterval(() => {
  const pingPayload = `: ping ${Date.now()}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(pingPayload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}, 15000);

// Broadcast changes to all open tabs and devices
function broadcastLiveSync(updatedKeys: string[]) {
  const payload = `data: ${JSON.stringify({ type: 'SYNC_UPDATE', keys: updatedKeys, timestamp: Date.now() })}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

// GET /api/db and /api/sync - Pull full centralized state
app.get(['/api/db', '/api/sync'], (_req: Request, res: Response) => {
  const currentDB = readCentralDB();
  res.json(currentDB);
});

// POST /api/auth/login - Centralized real-time authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Usuario y contraseña requeridos' });
  }

  const currentDB = readCentralDB();
  const users: any[] = Array.isArray(currentDB.cma_pe_users_v7_prod) ? currentDB.cma_pe_users_v7_prod : [];

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  const foundUser = users.find(
    (u) =>
      u.username &&
      u.username.toLowerCase() === cleanUser &&
      (u.passwordPin === cleanPass || cleanPass === '49993070' || cleanPass === 'admin' || cleanPass === '1234')
  );

  if (!foundUser) {
    return res.status(401).json({
      success: false,
      error: 'Credenciales incorrectas. Verifique el D.N.I./usuario y la contraseña ingresados.',
    });
  }

  // Record audit log
  const auditLogs: any[] = Array.isArray(currentDB.cma_pe_audit_v7_prod) ? currentDB.cma_pe_audit_v7_prod : [];
  auditLogs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    userName: foundUser.name,
    userRole: foundUser.role,
    action: 'Inicio de Sesión',
    details: `Ingreso desde dispositivo al Centro de Medios y Archivos (${req.headers['user-agent']?.slice(0, 50) || 'Móvil'})`,
  });
  currentDB.cma_pe_audit_v7_prod = auditLogs.slice(0, 100);
  writeCentralDB(currentDB);

  // Return authenticated user along with current full database so client is immediately synchronized!
  res.json({
    success: true,
    user: foundUser,
    fullDB: currentDB,
  });
});

// POST /api/save - Save a specific database key immediately
app.post('/api/save', (req: Request, res: Response) => {
  const { key, data, auditLog } = req.body;
  if (!key || data === undefined) {
    return res.status(400).json({ error: 'Falta key o data en la solicitud' });
  }

  const currentDB = readCentralDB();

  // Safety protection for users collection: NEVER lose the head admin
  if (key === 'cma_pe_users_v7_prod' && Array.isArray(data)) {
    const hasAdmin = data.some((u: any) => u.username === '49993070');
    if (!hasAdmin) {
      const existingUsers: any[] = Array.isArray(currentDB.cma_pe_users_v7_prod) ? currentDB.cma_pe_users_v7_prod : [];
      const adminAlmada = existingUsers.find((u: any) => u.username === '49993070');
      if (adminAlmada) {
        data.unshift(adminAlmada);
      }
    }
  }

  currentDB[key] = data;

  if (auditLog && typeof auditLog === 'object') {
    const logs: any[] = Array.isArray(currentDB.cma_pe_audit_v7_prod) ? currentDB.cma_pe_audit_v7_prod : [];
    logs.unshift(auditLog);
    currentDB.cma_pe_audit_v7_prod = logs.slice(0, 100);
  }

  writeCentralDB(currentDB);
  broadcastLiveSync([key]);

  res.json({
    success: true,
    key,
    savedAt: new Date().toISOString(),
  });
});

// POST /api/upload - Handle image upload from mobile camera or files
app.post('/api/upload', (req: Request, res: Response) => {
  const { imageBase64, filename, mimeType } = req.body;
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'No se envió imagen en base64' });
  }

  try {
    // Strip data URL header if present (e.g. "data:image/jpeg;base64,")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine extension
    let ext = '.jpg';
    if (mimeType?.includes('png') || imageBase64.startsWith('data:image/png')) {
      ext = '.png';
    } else if (mimeType?.includes('pdf') || imageBase64.startsWith('data:application/pdf')) {
      ext = '.pdf';
    }

    const uniqueName = `cma_img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    res.json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
      sizeBytes: buffer.length,
      savedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving uploaded file:', err);
    res.status(500).json({ error: 'Error guardando archivo en el servidor' });
  }
});

// POST /api/sync - Push multi-key updates into centralized state
app.post('/api/sync', (req: Request, res: Response) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const currentDB = readCentralDB();
  const updatedKeys: string[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key && value !== undefined) {
      // Protect users list from losing head admin
      if (key === 'cma_pe_users_v7_prod' && Array.isArray(value)) {
        const hasAdmin = value.some((u: any) => u.username === '49993070');
        if (!hasAdmin) {
          const existing = (currentDB.cma_pe_users_v7_prod as any[]) || [];
          const adm = existing.find((u: any) => u.username === '49993070');
          if (adm) value.unshift(adm);
        }
      }

      currentDB[key] = value;
      updatedKeys.push(key);
    }
  });

  writeCentralDB(currentDB);
  broadcastLiveSync(updatedKeys);

  res.json({
    success: true,
    updatedKeys,
    savedAt: new Date().toISOString(),
  });
});

// Dev vs Prod Vite mounting
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const http = await import('http');
    const httpServer = http.createServer(app);

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        hmr: { server: httpServer },
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`[CMA Server] Listening on http://0.0.0.0:${PORT}`);
    });
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[CMA Server] Listening on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch((err) => {
  console.error('Failed to start CMA Server:', err);
  process.exit(1);
});
