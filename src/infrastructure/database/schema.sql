-- PollosHermanos Database Schema
-- Phase 1: PostgreSQL Implementation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE estado_pedido AS ENUM ('PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'LISTO_PARA_ENTREGA', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO');
CREATE TYPE prioridad_pedido AS ENUM ('NORMAL', 'ALTA', 'URGENTE');
CREATE TYPE categoria_producto AS ENUM ('POLLO', 'CARNE', 'CERDO', 'PESCADO', 'LACTEOS', 'GRANOS', 'VERDURAS', 'FRUTAS', 'BEBIDAS', 'OTROS');
CREATE TYPE unidad_medida AS ENUM ('KG', 'LIBRA', 'UNIDAD', 'CAJA', 'PAQUETE', 'LITRO');
CREATE TYPE nivel_stock AS ENUM ('SIN_STOCK', 'STOCK_BAJO', 'NORMAL', 'SOBRESTOCK');
CREATE TYPE tipo_cliente AS ENUM ('MINORISTA', 'MAYORISTA', 'RESTAURANTE', 'REGULAR');
CREATE TYPE estado_cliente AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');
CREATE TYPE estado_ruta AS ENUM ('PLANIFICADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA');
CREATE TYPE tipo_transaccion AS ENUM ('VENTA', 'COMPRA', 'GASTO', 'PAGO', 'COBRO', 'DEVOLUCION');
CREATE TYPE metodo_pago AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CREDITO', 'OTRO');
CREATE TYPE user_role AS ENUM ('ADMIN', 'GERENTE', 'VENDEDOR', 'CONDUCTOR', 'CONTADOR');

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'VENDEDOR',
  nombre VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clientes table
CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(255) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  tipo tipo_cliente NOT NULL,
  estado estado_cliente DEFAULT 'ACTIVO',
  telefono VARCHAR(50),
  email VARCHAR(255),
  direcciones TEXT[],
  limite_credito DECIMAL(10, 2) DEFAULT 0,
  saldo_pendiente DECIMAL(10, 2) DEFAULT 0,
  total_compras DECIMAL(10, 2) DEFAULT 0,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_ultima_compra TIMESTAMP,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventario table
CREATE TABLE IF NOT EXISTS inventario (
  id VARCHAR(255) PRIMARY KEY,
  nombre_producto VARCHAR(255) NOT NULL,
  categoria categoria_producto NOT NULL,
  cantidad_actual DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unidad unidad_medida NOT NULL,
  nivel_stock nivel_stock DEFAULT 'NORMAL',
  stock_minimo DECIMAL(10, 2) DEFAULT 0,
  stock_maximo DECIMAL(10, 2) DEFAULT 0,
  costo_unitario DECIMAL(10, 2) DEFAULT 0,
  precio_venta DECIMAL(10, 2) DEFAULT 0,
  numero_lote VARCHAR(100),
  fecha_vencimiento TIMESTAMP,
  fecha_ultimo_movimiento TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos table
CREATE TABLE IF NOT EXISTS pedidos (
  id VARCHAR(255) PRIMARY KEY,
  id_cliente VARCHAR(255) NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  estado estado_pedido DEFAULT 'PENDIENTE',
  prioridad prioridad_pedido DEFAULT 'NORMAL',
  monto_total DECIMAL(10, 2) NOT NULL,
  direccion_entrega TEXT,
  fecha_entrega TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notas TEXT,
  id_ruta_asignada VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedido items table
CREATE TABLE IF NOT EXISTS pedido_items (
  id SERIAL PRIMARY KEY,
  id_pedido VARCHAR(255) NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  id_producto VARCHAR(255) NOT NULL REFERENCES inventario(id) ON DELETE RESTRICT,
  nombre_producto VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  notas TEXT
);

-- Rutas table
CREATE TABLE IF NOT EXISTS rutas (
  id VARCHAR(255) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  estado estado_ruta DEFAULT 'PLANIFICADA',
  fecha_planificada TIMESTAMP NOT NULL,
  fecha_inicio TIMESTAMP,
  fecha_finalizacion TIMESTAMP,
  id_conductor VARCHAR(255),
  nombre_conductor VARCHAR(255),
  id_vehiculo VARCHAR(255),
  distancia_total DECIMAL(10, 2) DEFAULT 0,
  tiempo_estimado INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paradas table
CREATE TABLE IF NOT EXISTS paradas (
  id SERIAL PRIMARY KEY,
  id_ruta VARCHAR(255) NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
  id_pedido VARCHAR(255) NOT NULL REFERENCES pedidos(id) ON DELETE RESTRICT,
  direccion TEXT NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  orden INTEGER NOT NULL,
  completada BOOLEAN DEFAULT FALSE,
  hora_llegada TIMESTAMP,
  hora_salida TIMESTAMP,
  notas TEXT
);

-- Transacciones financieras table
CREATE TABLE IF NOT EXISTS transacciones_financieras (
  id VARCHAR(255) PRIMARY KEY,
  tipo tipo_transaccion NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago metodo_pago NOT NULL,
  descripcion TEXT,
  referencia VARCHAR(255),
  categoria VARCHAR(100),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  anulada BOOLEAN DEFAULT FALSE,
  id_pedido VARCHAR(255) REFERENCES pedidos(id),
  id_cliente VARCHAR(255) REFERENCES clientes(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha_creacion ON pedidos(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_pedidos_ruta ON pedidos(id_ruta_asignada);

CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items(id_pedido);
CREATE INDEX IF NOT EXISTS idx_pedido_items_producto ON pedido_items(id_producto);

CREATE INDEX IF NOT EXISTS idx_clientes_tipo ON clientes(tipo);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);

CREATE INDEX IF NOT EXISTS idx_inventario_categoria ON inventario(categoria);
CREATE INDEX IF NOT EXISTS idx_inventario_nivel_stock ON inventario(nivel_stock);
CREATE INDEX IF NOT EXISTS idx_inventario_nombre ON inventario(nombre_producto);

CREATE INDEX IF NOT EXISTS idx_rutas_estado ON rutas(estado);
CREATE INDEX IF NOT EXISTS idx_rutas_fecha ON rutas(fecha_planificada);
CREATE INDEX IF NOT EXISTS idx_rutas_conductor ON rutas(id_conductor);

CREATE INDEX IF NOT EXISTS idx_paradas_ruta ON paradas(id_ruta);
CREATE INDEX IF NOT EXISTS idx_paradas_pedido ON paradas(id_pedido);

CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones_financieras(tipo);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones_financieras(fecha);
CREATE INDEX IF NOT EXISTS idx_transacciones_cliente ON transacciones_financieras(id_cliente);
CREATE INDEX IF NOT EXISTS idx_transacciones_pedido ON transacciones_financieras(id_pedido);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventario_updated_at BEFORE UPDATE ON inventario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rutas_updated_at BEFORE UPDATE ON rutas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacciones_updated_at BEFORE UPDATE ON transacciones_financieras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
