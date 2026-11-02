-- ==============================================================================
-- CENTRO DE MEDIOS Y ARCHIVOS - PUERTO ESPERANZA
-- ESQUEMA COMPLETO DE BASE DE DATOS POSTGRESQL PARA SUPABASE / VERCEL
-- Dominio de Producción: https://centro-de-medios-y-archivos.vercel.app
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE USUARIOS Y PERSONAL DE LA OFICINA
CREATE TABLE IF NOT EXISTS users_profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL, -- D.N.I. oficial (Ej: 49993070)
    password_pin TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'SECRETARIO', 'CARGADOR_DATOS', 'SOLICITANTE', 'VISITANTE')),
    assigned_area TEXT,
    position TEXT NOT NULL,
    telefono TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE ESTANTES FÍSICOS Y MOBILIARIO
CREATE TABLE IF NOT EXISTS office_shelves (
    id TEXT PRIMARY KEY,
    numero INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    descripcion TEXT,
    capacidad_carpetas INTEGER DEFAULT 15,
    folios_asignados JSONB DEFAULT '[]'::jsonb,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE DOCUMENTOS Y EXPEDIENTES (15 FOLIOS FÍSICOS)
CREATE TABLE IF NOT EXISTS archive_documents (
    id TEXT PRIMARY KEY,
    codigo_folio TEXT NOT NULL,
    titulo TEXT NOT NULL,
    folio_nombre TEXT,
    numero_hoja TEXT,
    area_operativa TEXT NOT NULL,
    tipo_administrativo TEXT NOT NULL,
    subtipo_detalle TEXT,
    anio INTEGER NOT NULL,
    estante_fisico TEXT NOT NULL,
    fecha DATE NOT NULL,
    autor TEXT NOT NULL,
    descripcion TEXT,
    soporte_fisico TEXT DEFAULT 'Planilla Impresa',
    visibilidad TEXT DEFAULT 'Uso Interno',
    foto_url TEXT,
    chicos_vinculados JSONB DEFAULT '[]'::jsonb,
    etiquetas JSONB DEFAULT '[]'::jsonb,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE INVENTARIO PATRIMONIAL INSTITUCIONAL (SEDE & ESPACIO ESPERANZA)
CREATE TABLE IF NOT EXISTS institutional_inventory (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    articulo TEXT NOT NULL,
    marca_y_modelo TEXT,
    accesorios_asociados TEXT,
    titularidad TEXT DEFAULT 'Propiedad Institucional (Sede)' CHECK (titularidad IN ('Propiedad Institucional (Sede)', 'Material Prestado por Integrante', 'Custodia Temporal (en Tránsito)')),
    propietario_o_prestador TEXT,
    responsable_custodia TEXT,
    persona_que_inventaria TEXT NOT NULL,
    dia TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    espacio_ubicacion TEXT NOT NULL CHECK (espacio_ubicacion IN ('SEDE CENTRAL', 'ESPACIO ESPERANZA SOMOS TODOS', 'GALPÓN TALLERES', 'CANCHA / EXTERIOR')),
    estante_asignado TEXT,
    area_asignada TEXT NOT NULL,
    categoria TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    estado TEXT NOT NULL CHECK (estado IN ('Excelente', 'Bueno', 'Regular', 'A Reparar', 'Baja')),
    observaciones TEXT,
    registrado_por_usuario TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLA DE PRÉSTAMOS DE MATERIALES CON FIRMA DIGITAL
CREATE TABLE IF NOT EXISTS material_loans (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL,
    item_nombre TEXT NOT NULL,
    area_operativa TEXT NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    actividad_destino TEXT,
    accesorios_incluidos TEXT,
    solicitante_nombre TEXT NOT NULL,
    solicitante_dni TEXT NOT NULL,
    solicitante_telefono TEXT,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion_pactada DATE NOT NULL,
    fecha_devolucion_real DATE,
    estado TEXT NOT NULL CHECK (estado IN ('En Curso', 'Devuelto', 'Atrasado')),
    estado_devolucion_condiciones TEXT,
    firma_retiro_url TEXT NOT NULL,
    firma_devolucion_url TEXT,
    observaciones_salida TEXT,
    observaciones_devolucion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.B TABLA DE CUSTODIA DE LLAVES Y SEGURIDAD (SECCIÓN 10)
CREATE TABLE IF NOT EXISTS key_custody_logs (
    id TEXT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    responsable_nombre TEXT NOT NULL,
    accion TEXT NOT NULL,
    observaciones TEXT,
    llave_estado TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA DE SOLICITUDES Y PEDIDOS DE ÁREAS
CREATE TABLE IF NOT EXISTS area_requests (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    area_solicitante TEXT NOT NULL,
    tipo_solicitud TEXT NOT NULL,
    solicitante_nombre TEXT NOT NULL,
    fecha_solicitud DATE NOT NULL,
    urgencia TEXT NOT NULL CHECK (urgencia IN ('Baja', 'Media', 'Alta', 'Urgente')),
    descripcion TEXT NOT NULL,
    cantidad_estimada TEXT,
    estado TEXT NOT NULL CHECK (estado IN ('Pendiente', 'Aprobado', 'Entregado', 'Rechazado')),
    respuesta_admin TEXT,
    fecha_respuesta DATE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLA DE ACTAS Y SESIONES DE ÁREA
CREATE TABLE IF NOT EXISTS area_actas (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    area_operativa TEXT NOT NULL,
    titulo TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    lugar TEXT NOT NULL,
    temario_orden_del_dia TEXT NOT NULL,
    participantes_presentes JSONB DEFAULT '[]'::jsonb,
    acuerdos_y_resoluciones TEXT NOT NULL,
    redactada_por TEXT NOT NULL,
    firmada_por_admin BOOLEAN DEFAULT FALSE,
    adjunto_foto_url TEXT,
    creada_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLA DE AVISOS Y ALERTAS INTERNAS
CREATE TABLE IF NOT EXISTS office_notices (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    nivel TEXT NOT NULL CHECK (nivel IN ('INFO', 'IMPORTANTE', 'URGENTE')),
    area_destino TEXT NOT NULL,
    destinatario_tipo TEXT DEFAULT 'TODOS' CHECK (destinatario_tipo IN ('TODOS', 'AREA', 'INDIVIDUAL', 'SELECCIONADOS')),
    destinatarios_ids JSONB DEFAULT '[]'::jsonb,
    destinatarios_nombres JSONB DEFAULT '[]'::jsonb,
    creado_por TEXT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    urgente BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABLA DE SEGUIMIENTO DE LECTURA DE AVISOS (READ RECEIPTS)
CREATE TABLE IF NOT EXISTS notice_read_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id TEXT REFERENCES office_notices(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    leido_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_notice_user_read UNIQUE(notice_id, user_id)
);

-- 11. TABLA DE CONVOCATORIAS / FICHAS DE INSCRIPCIÓN POR EQUIPO
CREATE TABLE IF NOT EXISTS area_inscription_forms (
    id TEXT PRIMARY KEY,
    area_operativa TEXT NOT NULL,
    titulo TEXT NOT NULL,
    deporte_o_actividad TEXT NOT NULL,
    nombre_evento TEXT NOT NULL,
    fecha_evento DATE NOT NULL,
    lugar_evento TEXT NOT NULL,
    monto_inscripcion NUMERIC(10, 2) DEFAULT 0,
    descripcion TEXT,
    habilitada BOOLEAN DEFAULT TRUE,
    max_equipos INTEGER,
    creada_por TEXT NOT NULL,
    creada_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABLA DE INSCRIPCIONES RECIBIDAS (EQUIPOS INSCRIPTOS)
CREATE TABLE IF NOT EXISTS inscription_submissions (
    id TEXT PRIMARY KEY,
    form_id TEXT REFERENCES area_inscription_forms(id) ON DELETE CASCADE,
    nombre_equipo TEXT NOT NULL,
    area_operativa TEXT NOT NULL,
    categoria_o_division TEXT NOT NULL,
    nombre_delegado_o_encargado TEXT NOT NULL,
    dni_delegado TEXT NOT NULL,
    telefono_delegado TEXT,
    numero_participantes INTEGER NOT NULL,
    monto_abonado NUMERIC(10, 2) DEFAULT 0,
    estado_pago TEXT NOT NULL CHECK (estado_pago IN ('Pendiente', 'Abonado', 'Exento')),
    comprobante_folio TEXT,
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notas TEXT
);

-- 13. SEEDING INICIAL DE INTEGRANTES OFICIALES
INSERT INTO users_profiles (id, username, password_pin, name, role, position, telefono, activo)
VALUES 
    ('user-admin-almada', '49993070', '49993070', 'Almada Eduardo Thomas', 'ADMIN', 'Coordinador General, Desarrollador Web y Administrador del Centro de Medios y Archivos', '03757-15499930', true),
    ('user-pablo-gonzalez', 'pablo.gonzalez', '1234', 'Pablo González', 'CARGADOR_DATOS', 'Equipo Fundador Centro de Medios y Archivos • Registro y Muebles', '03757-15433211', true),
    ('user-renzo-vazquez', 'renzo.vazquez', '1234', 'Renzo Vázquez', 'CARGADOR_DATOS', 'Equipo Fundador Centro de Medios y Archivos • Producción Técnica y Audiovisual', '03757-15433212', true),
    ('user-demian', 'demian', '1234', 'Demian', 'CARGADOR_DATOS', 'Equipo Fundador Centro de Medios y Archivos • Archivo y Custodia de Equipos', '03757-15433213', true),
    ('user-ezequiel-villalba', 'ezequiel.villalba', '1234', 'Ezequiel Villalba', 'CARGADOR_DATOS', 'Coordinador de Deportes y Acción Social', '03757-15421001', true),
    ('user-micaela', 'micaela', '1234', 'Micaela', 'CARGADOR_DATOS', 'Tallerista y Referente de Acción Social', '03757-15421002', true),
    ('user-cami-rodriguez', 'cami.rodriguez', '1234', 'Cami Rodríguez', 'CARGADOR_DATOS', 'Gestión Cultural y Producción de Eventos', '03757-15510203', true),
    ('user-mariel-rozas', 'mariel.rozas', '1234', 'Mariel Rozas 👑', 'SECRETARIO', 'Secretaria de Cultura y Muestras Artísticas', '03757-15510204', true),
    ('user-marcos-monzon', 'marcos.monzon', '1234', 'Marcos Monzon', 'CARGADOR_DATOS', 'Encargado de Ambiente y Huella Verde', '03757-15630304', true),
    ('user-santi', 'santi', '1234', 'Santi', 'SOLICITANTE', 'Brigada Verde y Logística de Rescate Animal', '03757-15630305', true),
    ('user-celine-rodriguez', 'celine.rodriguez', '1234', 'Celine Rodriguez', 'CARGADOR_DATOS', 'Diseño Gráfico, Prensa y Difusión Digital', '03757-15740405', true),
    ('user-visitante-comunidad', 'visitante', '1234', 'Consulta Comunitaria / Vecinos', 'VISITANTE', 'Consulta Pública de Talleres y Cartelera', NULL, true)
ON CONFLICT (username) DO NOTHING;

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_shelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_actas ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_inscription_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscription_submissions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS GENERALES DE LECTURA Y ESCRITURA
CREATE POLICY "Acceso total lectura" ON users_profiles FOR SELECT USING (true);
CREATE POLICY "Acceso total estantes" ON office_shelves FOR ALL USING (true);
CREATE POLICY "Acceso total documentos" ON archive_documents FOR ALL USING (true);
CREATE POLICY "Acceso total inventario" ON institutional_inventory FOR ALL USING (true);
CREATE POLICY "Acceso total préstamos" ON material_loans FOR ALL USING (true);
CREATE POLICY "Acceso total pedidos" ON area_requests FOR ALL USING (true);
CREATE POLICY "Acceso total actas" ON area_actas FOR ALL USING (true);
CREATE POLICY "Acceso total avisos" ON office_notices FOR ALL USING (true);
CREATE POLICY "Acceso total lecturas avisos" ON notice_read_receipts FOR ALL USING (true);
CREATE POLICY "Acceso total convocatorias" ON area_inscription_forms FOR ALL USING (true);
CREATE POLICY "Acceso total inscriptos" ON inscription_submissions FOR ALL USING (true);
