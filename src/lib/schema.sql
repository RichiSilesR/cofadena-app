-- Run this file to initialize your PostgreSQL database schema.

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Remember to HASH passwords in a real app
    role VARCHAR(50) NOT NULL,
    last_access VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients Table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers Table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(50) UNIQUE NOT NULL,
    age INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mixers Table
CREATE TABLE mixers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias VARCHAR(255) NOT NULL,
    plate VARCHAR(20) UNIQUE NOT NULL,
    capacity_m3 NUMERIC(5, 2) NOT NULL,
    internal_code VARCHAR(50) UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    progress INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    driver_ids UUID[],
    mixer_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports Table
CREATE TABLE production_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at TIMESTAMPTZ NOT NULL,
    arido1 NUMERIC(10, 2) DEFAULT 0,
    arido2 NUMERIC(10, 2) DEFAULT 0,
    arido3 NUMERIC(10, 2) DEFAULT 0,
    client_id UUID REFERENCES clients(id),
    project_id UUID REFERENCES projects(id),
    mixer_id UUID REFERENCES mixers(id),
    driver_id UUID REFERENCES drivers(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial data (optional, for testing)

INSERT INTO users (id, name, username, password, role, last_access, status) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'SRSR0402', 'SRSR0402', 'rodriputo', 'Super Usuario', '2025-07-20 15:23', 'Activo'),
('b2c3d4e5-f6a7-8901-2345-67890abcdef1', 'Supervisor', 'RASR0406', 'ricardopro', 'Supervisor', '2024-07-21 09:30', 'Activo'),
('c3d4e5f6-a7b8-9012-3456-7890abcdef2', 'Administrador', 'ADMIN', 'admin123', 'Administrador', NULL, 'Activo'),
('d4e5f6a7-b8c9-0123-4567-890abcdef3', 'Usuario', 'SRSR2003', 'sergiomanco', 'Usuario', '2024-07-20 18:00', 'Activo');

INSERT INTO reports (id, date, project_name, submitted_by, type) VALUES
('REP-1', '2025-01-15', 'Edificio Corporativo Central', 'Juan Pérez', 'Diario'),
('REP-2', '2025-02-20', 'Puente Metropolitano', 'María Rodriguez', 'Diario'),
('REP-3', '2025-03-05', 'Residencial Los Álamos', 'Juan Pérez', 'Diario'),
('REP-4', '2025-03-31', 'Todos', 'Ana Torres', 'Mensual');
