-- Agro-Cloud SQLite schema
-- Farmer profiles
CREATE TABLE IF NOT EXISTS farmers (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  village      TEXT,
  primary_crop TEXT,
  plot         TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Disease-detection scan history (crop imagery results)
CREATE TABLE IF NOT EXISTS scans (
  id           TEXT PRIMARY KEY,
  farmer_id    TEXT REFERENCES farmers(id) ON DELETE SET NULL,
  crop         TEXT NOT NULL,
  disease      TEXT NOT NULL,
  severity     TEXT,
  confidence   INTEGER,
  stress_ratio REAL,
  treatment    TEXT,                 -- JSON-encoded array of treatment steps
  scanned_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_farmer ON scans(farmer_id);

-- Advisory / alerts
CREATE TABLE IF NOT EXISTS advisory_alerts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  level       TEXT NOT NULL,          -- high | medium | low
  crop        TEXT,
  title       TEXT NOT NULL,
  description TEXT
);

-- Soil nutrient (NPK) readings vs. recommended levels
CREATE TABLE IF NOT EXISTS npk_levels (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,          -- e.g. "Nitrogen (N)"
  current     REAL,
  recommended REAL,
  unit        TEXT
);

-- Irrigation schedule / recommendations
CREATE TABLE IF NOT EXISTS irrigation_schedule (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  day     TEXT NOT NULL,
  action  TEXT,
  reason  TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Soil moisture time series (for trend chart)
CREATE TABLE IF NOT EXISTS soil_moisture_trend (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  day      TEXT NOT NULL,
  moisture REAL,
  sort_order INTEGER DEFAULT 0
);

-- Mandi (market) price trend time series, per crop columns
CREATE TABLE IF NOT EXISTS mandi_trend (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  day     TEXT NOT NULL,
  wheat   REAL,
  cotton  REAL,
  tomato  REAL,
  sort_order INTEGER DEFAULT 0
);

-- Mandi comparison snapshot (multiple mandis, per crop)
CREATE TABLE IF NOT EXISTS mandi_comparison (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  mandi    TEXT NOT NULL,
  crop     TEXT NOT NULL,
  price    REAL,
  distance TEXT,
  trend    TEXT              -- up | down
);

-- Buyer / trade leads (farm-to-market linkage)
CREATE TABLE IF NOT EXISTS buyers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  crop       TEXT,
  qty        TEXT,
  offer      TEXT,
  logistics  TEXT
);

-- Harvest window forecast (singleton row, id fixed at 1)
CREATE TABLE IF NOT EXISTS harvest_window (
  id           INTEGER PRIMARY KEY CHECK (id = 1),
  crop         TEXT,
  window_start TEXT,
  window_end   TEXT,
  note         TEXT
);
