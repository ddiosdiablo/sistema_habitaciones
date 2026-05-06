-- HabitaGest Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor
-- This will drop and recreate all tables to match the current codebase
-- NOTE: PostgREST converts camelCase JS keys to snake_case automatically,
-- so we use snake_case for all columns that map to camelCase in TypeScript.

-- Enable pgcrypto for gen_random_uuid() if not available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- DROP EXISTING TABLES AND POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow all on config" ON config;
DROP POLICY IF EXISTS "Allow all on habitaciones" ON habitaciones;
DROP POLICY IF EXISTS "Allow all on clientes" ON clientes;
DROP POLICY IF EXISTS "Allow all on estadias" ON estadias;
DROP POLICY IF EXISTS "Allow all on transacciones" ON transacciones;

DROP TABLE IF EXISTS transacciones CASCADE;
DROP TABLE IF EXISTS estadias CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS habitaciones CASCADE;
DROP TABLE IF EXISTS config CASCADE;

-- ============================================
-- 1. Configuración del negocio
-- Maps to ConfigNegocio type
-- ============================================
CREATE TABLE config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL DEFAULT 'Gestor de Habitaciones',
  direccion TEXT DEFAULT 'Av. Principal 123, Ciudad',
  telefono TEXT DEFAULT '+51 999 999 999',
  email TEXT DEFAULT '',
  leyenda_pie_recibo TEXT DEFAULT 'Gracias por su preferencia',
  impuesto_recibo DECIMAL(5,2) DEFAULT 0,
  tarifa_diaria_default DECIMAL(10,2) DEFAULT 50,
  tariff_mensual_default DECIMAL(10,2) DEFAULT 800,
  proximo_numero_recibo INTEGER DEFAULT 1001,
  usuario_admin TEXT DEFAULT '',
  contrasena_admin TEXT DEFAULT 'admin123',
  hora_checkout TEXT DEFAULT '13:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Habitaciones
-- Maps to Habitacion type
-- ============================================
CREATE TABLE habitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('dia', 'mes', 'mixto')),
  tarifa_diaria DECIMAL(10,2) DEFAULT 0,
  tariff_mensual DECIMAL(10,2) DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'mantenimiento', 'reservada')),
  descripcion TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Clientes
-- Maps to Cliente type
-- ============================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT NOT NULL,
  dni TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT DEFAULT '',
  nacionalidad TEXT DEFAULT '',
  fecha_registro DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Estadías (reservas/alquileres)
-- Maps to Estadia type
-- ============================================
CREATE TABLE estadias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habitacion_id UUID NOT NULL REFERENCES habitaciones(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('dia', 'mes')),
  fecha_entrada DATE NOT NULL,
  fecha_salida_estimada DATE,
  fecha_salida_real DATE,
  tarifa_original DECIMAL(10,2) DEFAULT 0,
  descuento DECIMAL(10,2) DEFAULT 0,
  tarifa_aplicada DECIMAL(10,2) NOT NULL,
  total_pagado DECIMAL(10,2) DEFAULT 0,
  saldo_pendiente DECIMAL(10,2) DEFAULT 0,
  esta_pagado BOOLEAN DEFAULT FALSE,
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Transacciones (pagos)
-- Maps to Transaccion type
-- ============================================
CREATE TABLE transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estadia_id UUID REFERENCES estadias(id) ON DELETE SET NULL,
  habitacion_id UUID REFERENCES habitaciones(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  numero_recibo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('checkin', 'checkout', 'pago', 'pago_parcial', 'otro')),
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
  concepto TEXT DEFAULT '',
  fecha TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE habitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estadias ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (allow all - can be restricted later)
-- ============================================
CREATE POLICY "Allow all on config" ON config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on habitaciones" ON habitaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on estadias" ON estadias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transacciones" ON transacciones FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Insert default config
-- ============================================
INSERT INTO config (nombre, direccion, telefono, email, leyenda_pie_recibo, impuesto_recibo, tarifa_diaria_default, tariff_mensual_default, proximo_numero_recibo, usuario_admin, contrasena_admin, hora_checkout)
VALUES ('Gestor de Habitaciones', 'Av. Principal 123, Ciudad', '+51 999 999 999', 'contacto@gestorhabitaciones.com', 'Gracias por su preferencia', 0, 50, 800, 1001, '', 'admin123', '13:00');

-- ============================================
-- Insert sample rooms
-- ============================================
INSERT INTO habitaciones (numero, tipo, tarifa_diaria, tariff_mensual, estado, descripcion)
VALUES 
  ('101', 'dia', 50, 0, 'disponible', 'Habitación individual'),
  ('102', 'dia', 50, 0, 'disponible', 'Habitación individual'),
  ('103', 'dia', 50, 0, 'disponible', 'Habitación doble'),
  ('201', 'mes', 0, 800, 'disponible', 'Habitación mensual'),
  ('202', 'mes', 0, 800, 'disponible', 'Habitación mensual');
