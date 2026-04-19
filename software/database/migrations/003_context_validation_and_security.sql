-- Context-aware configuration, validation metadata, calibration tracking,
-- controller capability limits, alert dedupe support, and pairing tokens.

ALTER TABLE IF EXISTS controllers
    ADD COLUMN IF NOT EXISTS environment_type TEXT,
    ADD COLUMN IF NOT EXISTS indoor_outdoor TEXT,
    ADD COLUMN IF NOT EXISTS min_reporting_interval_sec INTEGER NOT NULL DEFAULT 600,
    ADD COLUMN IF NOT EXISTS supports_adaptive_sampling BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS supports_local_alerts BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS offline_buffer_capacity INTEGER NOT NULL DEFAULT 2000,
    ADD COLUMN IF NOT EXISTS capability_profile_json JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE IF EXISTS sensors
    ADD COLUMN IF NOT EXISTS context_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS asset_type TEXT,
    ADD COLUMN IF NOT EXISTS last_calibrated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS calibration_interval_days INTEGER,
    ADD COLUMN IF NOT EXISTS calibration_due_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS calibration_status TEXT NOT NULL DEFAULT 'UNKNOWN';

ALTER TABLE IF EXISTS sensor_configs
    ADD COLUMN IF NOT EXISTS purpose TEXT,
    ADD COLUMN IF NOT EXISTS context_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS validation_status TEXT NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS validation_warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS applied_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS confidence_score DOUBLE PRECISION;

ALTER TABLE IF EXISTS alerts
    ADD COLUMN IF NOT EXISTS dedupe_key TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS first_triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS pairing_tokens (
    id UUID PRIMARY KEY,
    controller_id UUID NOT NULL REFERENCES controllers(id),
    token_hash TEXT NOT NULL UNIQUE,
    issued_for_account_id UUID REFERENCES accounts(id),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sensor_configs_sensor_active_created_at
    ON sensor_configs(sensor_id, active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pairing_tokens_controller_id
    ON pairing_tokens(controller_id);

CREATE INDEX IF NOT EXISTS idx_pairing_tokens_token_hash
    ON pairing_tokens(token_hash);

CREATE INDEX IF NOT EXISTS idx_alerts_dedupe_key
    ON alerts(dedupe_key);
