import { Router } from 'express'
import { getAdvisoryAlerts, getNpkLevels, getIrrigationSchedule, getSoilMoistureTrend } from '../db/index.js'

const router = Router()

router.get('/alerts', (req, res) => res.json(getAdvisoryAlerts()))
router.get('/npk', (req, res) => res.json(getNpkLevels()))
router.get('/irrigation', (req, res) => res.json(getIrrigationSchedule()))
router.get('/moisture-trend', (req, res) => res.json(getSoilMoistureTrend()))

// ---- Live weather via Open-Meteo (free, no API key, no signup) ----
// Default coordinates match the seed farmer's village (Ujjain, Madhya Pradesh)
// so the demo tells a coherent story end-to-end.
const DEFAULT_LAT = 23.1765
const DEFAULT_LON = 75.7885

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 min — avoids hammering the API on every dashboard refresh
const weatherCache = new Map() // "lat,lon" -> { data, expiresAt }

async function fetchLiveWeather(lat, lon) {
  const cacheKey = `${lat},${lon}`
  const cached = weatherCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.data

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lon)
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,rain')
  url.searchParams.set('hourly', 'soil_moisture_0_1cm')
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error(`Open-Meteo responded ${response.status}`)
  const json = await response.json()

  const current = json.current || {}

  // Pull the hourly soil-moisture reading closest to the current hour.
  let soilMoisturePct = null
  if (Array.isArray(json.hourly?.time) && Array.isArray(json.hourly?.soil_moisture_0_1cm)) {
    const currentHourKey = (current.time || '').slice(0, 13) // "YYYY-MM-DDTHH"
    let idx = json.hourly.time.findIndex((t) => t.slice(0, 13) === currentHourKey)
    if (idx < 0) idx = 0
    const raw = json.hourly.soil_moisture_0_1cm[idx]
    // Open-Meteo reports volumetric soil moisture as m3/m3 (0–1) — scale to a %-style reading
    if (typeof raw === 'number') soilMoisturePct = Math.round(raw * 100)
  }

  const data = {
    temp: { value: round1(current.temperature_2m), unit: '°C', delta: 'live · Open-Meteo' },
    humidity: { value: round1(current.relative_humidity_2m), unit: '%', delta: 'live · Open-Meteo' },
    moisture: { value: soilMoisturePct, unit: '%', delta: 'live · soil 0-1cm' },
    rain: { value: round1(current.rain ?? current.precipitation ?? 0), unit: 'mm', delta: 'live · Open-Meteo' },
    source: 'open-meteo',
    location: { lat, lon },
  }

  weatherCache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS })
  return data
}

function round1(n) {
  return typeof n === 'number' ? Math.round(n * 10) / 10 : null
}

// Simulated fallback — only used if the live API is unreachable, so the
// demo never breaks even if Wi-Fi drops or the API is briefly down.
function mockFieldConditions() {
  const jitter = (base, range) => Math.round((base + (Math.random() - 0.5) * range) * 10) / 10
  return {
    temp: { value: jitter(31, 2), unit: '°C', delta: '+2.1 vs avg' },
    humidity: { value: jitter(64, 4), unit: '%', delta: '-3 vs avg' },
    moisture: { value: jitter(42, 3), unit: '%', delta: '-8 vs ideal' },
    rain: { value: jitter(6, 2), unit: 'mm', delta: 'light showers' },
    source: 'mock',
  }
}

router.get('/field-conditions', async (req, res) => {
  const lat = Number(req.query.lat) || DEFAULT_LAT
  const lon = Number(req.query.lon) || DEFAULT_LON
  try {
    const data = await fetchLiveWeather(lat, lon)
    res.json(data)
  } catch (err) {
    console.warn('[weather] Open-Meteo fetch failed, falling back to mock data:', err.message)
    res.json(mockFieldConditions())
  }
})

export default router
