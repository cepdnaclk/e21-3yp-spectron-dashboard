-- Core schema for Spectron backend (PostgreSQL + TimescaleDB)

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS account_memberships (
    account_id UUID REFERENCES accounts(id),
    user_id UUID REFERENCES users(id),
    role TEXT NOT NULL CHECK (role IN ('OWNER','ADMIN','VIEWER')),
    PRIMARY KEY (account_id, user_id)
);

CREATE TABLE IF NOT EXISTS controllers (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id),
    hw_id TEXT UNIQUE NOT NULL,
    name TEXT,
    purpose TEXT,
    location TEXT,
    qr_code TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'OFFLINE',
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sensors (
    id UUID PRIMARY KEY,
    controller_id UUID NOT NULL REFERENCES controllers(id),
    hw_id TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT,
    purpose TEXT,
    unit TEXT,
    status TEXT NOT NULL DEFAULT 'OK',
    last_seen TIMESTAMPTZ,
    UNIQUE (controller_id, hw_id)
);

CREATE TABLE IF NOT EXISTS sensor_groups (
    id UUID PRIMARY KEY,
    controller_id UUID NOT NULL REFERENCES controllers(id),
    name TEXT NOT NULL,
    purpose TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sensor_group_members (
    group_id UUID REFERENCES sensor_groups(id),
    sensor_id UUID REFERENCES sensors(id),
    PRIMARY KEY (group_id, sensor_id)
);

CREATE TABLE IF NOT EXISTS sensor_configs (
    id UUID PRIMARY KEY,
    sensor_id UUID NOT NULL REFERENCES sensors(id),
    config_json JSONB NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS controller_configs (
    id UUID PRIMARY KEY,
    controller_id UUID NOT NULL REFERENCES controllers(id),
    config_json JSONB NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL REFERENCES accounts(id),
    controller_id UUID REFERENCES controllers(id),
    sensor_id UUID REFERENCES sensors(id),
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    time TIMESTAMPTZ NOT NULL,
    sensor_id UUID NOT NULL REFERENCES sensors(id),
    value DOUBLE PRECISION NOT NULL,
    meta JSONB,
    PRIMARY KEY (time, sensor_id)
);

-- Turn sensor_readings into a Timescale hypertable (optional).
-- This requires the TimescaleDB extension to be installed in the database.
-- If TimescaleDB is not available, the table will work as a regular PostgreSQL table.
DO $$
BEGIN
    -- Try to create hypertable if TimescaleDB is available
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
        PERFORM create_hypertable('sensor_readings', 'time', if_not_exists => TRUE);
    ELSE
        -- Create index for better query performance without TimescaleDB
        CREATE INDEX IF NOT EXISTS idx_sensor_readings_time ON sensor_readings(time DESC);
        CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
        RAISE NOTICE 'TimescaleDB not available. Using regular PostgreSQL table with indexes.';
    END IF;
END $$;
