-- HabitaGest Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- 1. Configuración del negocio
CREATE TABLE IF NOT EXISTS config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL DEFAULT 'Gestor de Habitaciones',
  direccion TEXT DEFAULT 'Av. Principal 123, Ciudad',
  telefono TEXT DEFAULT '+51 999 999 999',
  email TEXT,
  leyendaPieRecibo TEXT DEFAULT 'Gracias por su preferencia',
  impuestoRecibo DECIMAL(5,2) DEFAULT 0,
  tarifaDiariaDefault DECIMAL(10,2) DEFAULT 50,
  tariffMensualDefault DECIMAL(10,2) DEFAULT 800,
  proximoNumeroRecibo INTEGER DEFAULT 1001,
  contrasenaAdmin TEXT DEFAULT 'admin123',
  horaCheckout TIME DEFAULT '13:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habitaciones
CREATE TABLE IF NOT EXISTS habitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('dia', 'mes', 'mixto')),
  precio DECIMAL(10,2),
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'mantenimiento', 'reservada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombreCompleto TEXT NOT NULL,
  dni TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT,
  nacionalidad TEXT,
  fechaRegistro DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Estadías (reservas/alquileres)
CREATE TABLE IF NOT EXISTS estadias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitacionId UUID NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
  clienteId UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('dia', 'mes')),
  fechaEntrada DATE NOT NULL,
  fechaSalidaEstimada DATE,
  fechaSalidaReal DATE,
  tarifaAplicada DECIMAL(10,2) NOT NULL,
  totalPagado DECIMAL(10,2) DEFAULT 0,
  saldoPendiente DECIMAL(10,2) DEFAULT 0,
  estaPagado BOOLEAN DEFAULT FALSE,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Transacciones (pagos)
CREATE TABLE IF NOT EXISTS transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estadiaId UUID REFERENCES estadias(id) ON DELETE SET NULL,
  habitacionId UUID REFERENCES habitaciones(id) ON DELETE SET NULL,
  clienteId UUID REFERENCES clientes(id) ON DELETE SET NULL,
  numeroRecibo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('checkin', 'checkout', 'pago_parcial', 'otro')),
  monto DECIMAL(10,2) NOT NULL,
  metodoPago TEXT NOT NULL CHECK (metodoPago IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
  concepto TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estadias ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (allow all for now - can be restricted later)
CREATE POLICY "Allow all on config" ON config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on habitaciones" ON habitaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on estadias" ON estadias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transacciones" ON transacciones FOR ALL USING (true) WITH CHECK (true);

-- Insert default config if not exists
INSERT INTO config (nombre) SELECT 'Gestor de Habitaciones' WHERE NOT EXISTS (SELECT 1 FROM config LIMIT 1);

-- Insert sample rooms if not exists
INSERT INTO habitaciones (numero, tipo, precio, estado)
SELECT * FROM (VALUES 
  ('101', 'dia', 50, 'disponible'),
  ('102', 'dia', 50, 'disponible'),
  ('103', 'dia', 50, 'disponible'),
  ('201', 'mes', 800, 'disponible'),
  ('202', 'mes', 800, 'disponible')
) AS data(numero, tipo, precio, estado)
WHERE NOT EXISTS (SELECT 1 FROM habitaciones LIMIT 1);