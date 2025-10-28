-- Asegurarse de que la extensión pgcrypto esté disponible para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Super Usuario', 'Administrador', 'Supervisor', 'Usuario')),
    last_access TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    contact VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Choferes
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(100) NOT NULL UNIQUE,
    age INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Mixers
CREATE TABLE mixers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias VARCHAR(100) NOT NULL,
    plate VARCHAR(50) NOT NULL UNIQUE,
    capacity_m3 NUMERIC(5, 2) NOT NULL,
    internal_code VARCHAR(50) UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de Proyectos
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('En Curso', 'Completado', 'En Pausa', 'Retrasado')),
    progress INT NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de unión para Proyectos y Choferes (Relación Muchos a Muchos)
CREATE TABLE project_drivers (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, driver_id)
);

-- Tabla de unión para Proyectos y Mixers (Relación Muchos a Muchos)
CREATE TABLE project_mixers (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    mixer_id UUID NOT NULL REFERENCES mixers(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, mixer_id)
);

            
-- Inserts de ejemplo con contraseñas hasheadas
-- Las contraseñas originales son: 'rodriputo', 'admin123', 'ricardopro', 'sergiomanco'
INSERT INTO users (name, username, password_hash, role, status) VALUES
('Samuel Rocha', 'SRSR0402', '$2a$10$wN3.d.p3L9u9W8xLg9t7a.2T/O5Xq/E8T.gHk8L.3aG.gG.zB9k/i', 'Super Usuario', 'Activo'),
('Admin User', 'ADMIN', '$2a$10$fW3CgK/gI8p9J7gB6d.bIu0g/8Yl.ZfHj5N.n/u.tP.gT9r.yT2rS', 'Administrador', 'Activo'),
('Ricardo Supervisor', 'RASR0406', '$2a$10$sC4r/fT6wL5n8o/N.pL8f.pG/9Yl.ZfHj5N.n/u.tP.gT9r.yT2rS', 'Supervisor', 'Activo'),
('Sergio User', 'SRSR2003', '$2a$10$jD5e/fT6wL5n8o/N.pL8f.pG/9Yl.ZfHj5N.n/u.tP.gT9r.yT2rS', 'Usuario', 'Inactivo');

-- Los IDs se autogeneran, por eso no se especifican.
INSERT INTO clients (name, contact, email, phone, address, notes) VALUES
('Constructora Horizonte S.A.', 'Juan Pérez', 'contacto@horizonte.com', '71234567', 'Av. Principal #123', 'Cliente prioritario'),
('Inversiones Futuro Ltda.', 'Maria García', 'proyectos@futuro.com', '69876543', 'Calle Falsa #456', NULL),
('Urbanizaciones Modernas', 'Luisa Fernandez', 'info@urban.bo', '76543210', 'Zona Sur, Calle 8', 'Requiere facturación especial');

INSERT INTO drivers (name, document, age) VALUES
('Carlos Rodriguez', '1234567 LP', 35),
('Pedro Martinez', '7654321 CB', 42),
('Luis Gonzales', '8889900 SC', 28);

INSERT INTO mixers (alias, plate, capacity_m3, internal_code, notes) VALUES
('Titan 01', '4032LPD', 8, 'M-01', 'Mantenimiento reciente.'),
('Gigante 02', '3122ABC', 10, 'M-02', 'Revisar neumáticos.'),
('Coloso 03', '5544XYZ', 8, 'M-03', 'Sistema hidráulico nuevo.');

-- Triggers para actualizar automáticamente el campo `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_mixers_updated_at BEFORE UPDATE ON mixers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Tabla de Reportes de Producción (registros históricos de parámetros)
CREATE TABLE production_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- fecha y hora del registro
        arido1 NUMERIC(8,3) NOT NULL DEFAULT 0,
        arido2 NUMERIC(8,3) NOT NULL DEFAULT 0,
        arido3 NUMERIC(8,3) NOT NULL DEFAULT 0,
        client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        mixer_id UUID REFERENCES mixers(id) ON DELETE SET NULL,
        driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas por rango de fecha y por entidades relacionadas
CREATE INDEX IF NOT EXISTS idx_production_reports_occurred_at ON production_reports (occurred_at);
CREATE INDEX IF NOT EXISTS idx_production_reports_client_id ON production_reports (client_id);
CREATE INDEX IF NOT EXISTS idx_production_reports_project_id ON production_reports (project_id);

-- Insert ejemplo
INSERT INTO production_reports (occurred_at, arido1, arido2, arido3, client_id, project_id, mixer_id, driver_id, notes)
VALUES
    (NOW() - INTERVAL '2 days', 10.5, 12.0, 9.8, (SELECT id FROM clients LIMIT 1), (SELECT id FROM projects LIMIT 1), (SELECT id FROM mixers LIMIT 1), (SELECT id FROM drivers LIMIT 1), 'Producción de prueba A'),
    (NOW() - INTERVAL '1 day', 11.0, 11.5, 10.0, (SELECT id FROM clients LIMIT 1 OFFSET 1), (SELECT id FROM projects LIMIT 1), (SELECT id FROM mixers LIMIT 1 OFFSET 1), (SELECT id FROM drivers LIMIT 1 OFFSET 1), 'Producción de prueba B');
