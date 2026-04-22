-- User profile fields used by the web profile screen.

ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;
