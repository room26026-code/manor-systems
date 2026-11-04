CREATE TABLE IF NOT EXISTS redeemed_codes (
    code TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    redeemed_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS redeemed_codes_app_id ON redeemed_codes (app_id);
