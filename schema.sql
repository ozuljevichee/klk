-- ─── Patagonia Circular — D1 Schema ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  usuario TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  rol TEXT NOT NULL,
  departamento TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL DEFAULT '',
  fecha_ingreso TEXT NOT NULL DEFAULT '',
  cumpleanos TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  permisos TEXT NOT NULL DEFAULT '[]',
  activo INTEGER NOT NULL DEFAULT 1,
  foto TEXT,
  can_publish INTEGER NOT NULL DEFAULT 0,
  can_delete_bitacora INTEGER NOT NULL DEFAULT 0,
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,
  empresa TEXT NOT NULL,
  oc TEXT NOT NULL DEFAULT '',
  material TEXT NOT NULL,
  peso_unit_kg REAL NOT NULL DEFAULT 0,
  cantidad INTEGER NOT NULL DEFAULT 0,
  total_kg REAL NOT NULL DEFAULT 0,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'ingresado',
  solicitante TEXT NOT NULL DEFAULT '',
  fecha_creacion TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  deleted INTEGER NOT NULL DEFAULT 0,
  deleted_by TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pedido_bitacora (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  usuario TEXT NOT NULL,
  imagen TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pedido_auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  usuario TEXT NOT NULL,
  accion TEXT NOT NULL,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  detalle TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mantenimientos (
  id TEXT PRIMARY KEY,
  equipo_nombre TEXT NOT NULL,
  equipo_codigo TEXT NOT NULL,
  fecha TEXT NOT NULL,
  proximo_mant TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  responsable TEXT NOT NULL,
  imagen TEXT,
  nro_factura TEXT,
  factura_img TEXT,
  creado_por TEXT NOT NULL,
  fecha_creacion TEXT NOT NULL,
  hora_creacion TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  deleted INTEGER NOT NULL DEFAULT 0,
  deleted_by TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mant_accesorios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mant_id TEXT NOT NULL REFERENCES mantenimientos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS mant_auditoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mant_id TEXT NOT NULL REFERENCES mantenimientos(id) ON DELETE CASCADE,
  usuario TEXT NOT NULL,
  accion TEXT NOT NULL,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  detalle TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS noticias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  cuerpo TEXT NOT NULL,
  autor TEXT NOT NULL,
  rol TEXT NOT NULL,
  fecha TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'comunicado',
  imagen TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  at TEXT NOT NULL,
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sugerencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  texto TEXT NOT NULL,
  autor TEXT NOT NULL,
  fecha TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Seed: usuario administrador inicial ──────────────────────────────────────
INSERT OR IGNORE INTO users (nombre, apellido, usuario, password, rol, departamento, email, telefono, fecha_ingreso, cumpleanos, avatar, permisos, activo, can_publish, can_delete_bitacora)
VALUES
  ('Carlos', 'Mansilla', 'admin', '1234', 'Administrador', 'Gestión', 'cmansilla@patagoniacircular.cl', '+56 9 8812 3456', '15/03/2019', '12/08/1985', 'CM', '["inicio","informacion","pedidos","mantenimientos","companeros","admin"]', 1, 1, 1),
  ('Jorge', 'Pérez', 'jperez', '1234', 'Operario', 'Operaciones', 'jperez@patagoniacircular.cl', '+56 9 7723 4567', '02/06/2021', '24/11/1990', 'JP', '["inicio","informacion","pedidos","mantenimientos","companeros"]', 1, 0, 0),
  ('María', 'Rojas', 'mrojas', '1234', 'Jefa de Turno', 'Logística', 'mrojas@patagoniacircular.cl', '+56 9 6634 5678', '10/01/2020', '05/03/1988', 'MR', '["inicio","informacion","pedidos","mantenimientos","companeros"]', 1, 0, 0),
  ('Andrés', 'Fuentes', 'afuentes', '1234', 'Técnico Mecánico', 'Mantenimiento', 'afuentes@patagoniacircular.cl', '+56 9 5545 6789', '01/03/2022', '18/07/1992', 'AF', '["inicio","informacion","mantenimientos","companeros"]', 1, 0, 0);
