import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { nanoid } from 'nanoid'
import { seedData } from './seedData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'agro.db')
const SCHEMA_PATH = path.join(__dirname, 'schema.sql')

const isFreshDb = !fs.existsSync(DB_PATH)

const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA foreign_keys = ON;')

// Run schema migration (idempotent — CREATE TABLE IF NOT EXISTS everywhere)
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf-8'))

// ---- Seed on first run only ----
if (isFreshDb) {
  const insertFarmer = db.prepare(
    `INSERT INTO farmers (id, name, village, primary_crop, plot) VALUES (?, ?, ?, ?, ?)`
  )
  const insertScan = db.prepare(
    `INSERT INTO scans (id, crop, disease, severity, confidence, stress_ratio, treatment, scanned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const insertAlert = db.prepare(
    `INSERT INTO advisory_alerts (level, crop, title, description) VALUES (?, ?, ?, ?)`
  )
  const insertNpk = db.prepare(
    `INSERT INTO npk_levels (name, current, recommended, unit) VALUES (?, ?, ?, ?)`
  )
  const insertIrrigation = db.prepare(
    `INSERT INTO irrigation_schedule (day, action, reason, sort_order) VALUES (?, ?, ?, ?)`
  )
  const insertMoisture = db.prepare(
    `INSERT INTO soil_moisture_trend (day, moisture, sort_order) VALUES (?, ?, ?)`
  )
  const insertMandiTrend = db.prepare(
    `INSERT INTO mandi_trend (day, wheat, cotton, tomato, sort_order) VALUES (?, ?, ?, ?, ?)`
  )
  const insertMandiComparison = db.prepare(
    `INSERT INTO mandi_comparison (mandi, crop, price, distance, trend) VALUES (?, ?, ?, ?, ?)`
  )
  const insertBuyer = db.prepare(
    `INSERT INTO buyers (name, crop, qty, offer, logistics) VALUES (?, ?, ?, ?, ?)`
  )
  const insertHarvestWindow = db.prepare(
    `INSERT INTO harvest_window (id, crop, window_start, window_end, note) VALUES (1, ?, ?, ?, ?)`
  )

  db.exec('BEGIN')
  try {
    for (const f of seedData.farmers) {
      insertFarmer.run(f.id, f.name, f.village ?? null, f.primaryCrop ?? null, f.plot ?? null)
    }
    for (const s of seedData.scans) {
      insertScan.run(
        s.id,
        s.crop,
        s.disease,
        s.severity ?? null,
        s.confidence ?? null,
        s.stressRatio ?? null,
        JSON.stringify(s.treatment || []),
        s.date
      )
    }
    for (const a of seedData.advisoryAlerts) {
      insertAlert.run(a.level, a.crop ?? null, a.title, a.description ?? null)
    }
    for (const n of seedData.npkLevels) {
      insertNpk.run(n.name, n.current ?? null, n.recommended ?? null, n.unit ?? null)
    }
    seedData.irrigationSchedule.forEach((r, i) => {
      insertIrrigation.run(r.day, r.action ?? null, r.reason ?? null, i)
    })
    seedData.soilMoistureTrend.forEach((r, i) => {
      insertMoisture.run(r.day, r.moisture ?? null, i)
    })
    seedData.mandiTrend.forEach((r, i) => {
      insertMandiTrend.run(r.day, r.wheat ?? null, r.cotton ?? null, r.tomato ?? null, i)
    })
    for (const r of seedData.mandiComparison) {
      insertMandiComparison.run(r.mandi, r.crop, r.price ?? null, r.distance ?? null, r.trend ?? null)
    }
    for (const b of seedData.buyers) {
      insertBuyer.run(b.name, b.crop ?? null, b.qty ?? null, b.offer ?? null, b.logistics ?? null)
    }
    const hw = seedData.harvestWindow
    insertHarvestWindow.run(hw.crop ?? null, hw.windowStart ?? null, hw.windowEnd ?? null, hw.note ?? null)
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
  console.log('[db] Fresh database created and seeded at', DB_PATH)
}

// ---- Row <-> API-shape mappers ----
const mapScan = (row) => ({
  id: row.id,
  farmerId: row.farmer_id || undefined,
  crop: row.crop,
  disease: row.disease,
  severity: row.severity,
  confidence: row.confidence,
  stressRatio: row.stress_ratio,
  treatment: row.treatment ? JSON.parse(row.treatment) : [],
  date: row.scanned_at,
})

const mapFarmer = (row) => ({
  id: row.id,
  name: row.name,
  village: row.village,
  primaryCrop: row.primary_crop,
  plot: row.plot,
})

const mapAlert = (row) => ({
  id: row.id,
  level: row.level,
  crop: row.crop,
  title: row.title,
  desc: row.description,
})

// ================= Farmers =================
export function getFarmers() {
  return db.prepare(`SELECT * FROM farmers ORDER BY created_at ASC`).all().map(mapFarmer)
}

export function addFarmer({ name, village, primaryCrop, plot }) {
  const farmer = { id: nanoid(8), name, village, primaryCrop, plot }
  db.prepare(
    `INSERT INTO farmers (id, name, village, primary_crop, plot) VALUES (?, ?, ?, ?, ?)`
  ).run(farmer.id, farmer.name, farmer.village ?? null, farmer.primaryCrop ?? null, farmer.plot ?? null)
  return farmer
}

// ================= Scans =================
export function getScans(limit = 10) {
  return db
    .prepare(`SELECT * FROM scans ORDER BY scanned_at DESC LIMIT ?`)
    .all(limit)
    .map(mapScan)
}

export function addScan({ crop, disease, severity, confidence, stressRatio, treatment, farmerId }) {
  const scan = {
    id: nanoid(8),
    farmer_id: farmerId || null,
    crop,
    disease,
    severity,
    confidence,
    stress_ratio: stressRatio,
    treatment: JSON.stringify(treatment || []),
    scanned_at: new Date().toISOString(),
  }
  db.prepare(
    `INSERT INTO scans (id, farmer_id, crop, disease, severity, confidence, stress_ratio, treatment, scanned_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    scan.id,
    scan.farmer_id,
    scan.crop,
    scan.disease,
    scan.severity ?? null,
    scan.confidence ?? null,
    scan.stress_ratio ?? null,
    scan.treatment,
    scan.scanned_at
  )

  // Keep only the most recent 50 scans (mirrors previous lowdb behaviour)
  db.prepare(
    `DELETE FROM scans WHERE id NOT IN (SELECT id FROM scans ORDER BY scanned_at DESC LIMIT 50)`
  ).run()

  return mapScan(scan)
}

// ================= Advisory =================
export function getAdvisoryAlerts() {
  return db.prepare(`SELECT * FROM advisory_alerts ORDER BY id ASC`).all().map(mapAlert)
}

export function getNpkLevels() {
  return db.prepare(`SELECT name, current, recommended, unit FROM npk_levels ORDER BY id ASC`).all()
}

export function getIrrigationSchedule() {
  return db
    .prepare(`SELECT day, action, reason FROM irrigation_schedule ORDER BY sort_order ASC`)
    .all()
}

export function getSoilMoistureTrend() {
  return db
    .prepare(`SELECT day, moisture FROM soil_moisture_trend ORDER BY sort_order ASC`)
    .all()
}

// ================= Market =================
export function getMandiTrend() {
  return db
    .prepare(`SELECT day, wheat, cotton, tomato FROM mandi_trend ORDER BY sort_order ASC`)
    .all()
}

export function getMandiComparison() {
  return db
    .prepare(`SELECT mandi, crop, price, distance, trend FROM mandi_comparison ORDER BY id ASC`)
    .all()
}

export function getBuyers() {
  return db.prepare(`SELECT id, name, crop, qty, offer, logistics FROM buyers ORDER BY id ASC`).all()
}

export function getHarvestWindow() {
  const row = db.prepare(`SELECT crop, window_start, window_end, note FROM harvest_window WHERE id = 1`).get()
  if (!row) return null
  return { crop: row.crop, windowStart: row.window_start, windowEnd: row.window_end, note: row.note }
}

export default db
