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

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Server-Sent Events clients for live push sync across devices
const sseClients: Response[] = [];

// Helper to read DB safely
function readCentralDB(): Record<string, unknown> {
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
function writeCentralDB(data: Record<string, unknown>): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing central DB:', err);
  }
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    institution: 'Centro de Medios y Archivos - Puerto Esperanza',
    sync: 'active',
    timestamp: new Date().toISOString(),
  });
});

// SSE Live Sync stream endpoint
app.get('/api/sync/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Broadcast changes to all open tabs and devices
function broadcastLiveSync(updatedKeys: string[]) {
  const payload = `data: ${JSON.stringify({ type: 'SYNC_UPDATE', keys: updatedKeys, timestamp: Date.now() })}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// GET /api/sync - Pull current centralized state
app.get('/api/sync', (_req: Request, res: Response) => {
  const currentDB = readCentralDB();
  res.json(currentDB);
});

// POST /api/sync - Push updates from any device into centralized state
app.post('/api/sync', (req: Request, res: Response) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const currentDB = readCentralDB();
  const updatedKeys: string[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    if (key && value !== undefined) {
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
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CMA Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CMA Server:', err);
  process.exit(1);
});
