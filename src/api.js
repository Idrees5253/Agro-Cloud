const API_BASE = `${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api`

async function safeGet(path, fallback) {
  try {
    const res = await fetch(`${API_BASE}${path}`)
    if (!res.ok) throw new Error('bad response')
    return await res.json()
  } catch (err) {
    console.warn(`API unavailable for ${path}, using local fallback data.`)
    return fallback
  }
}

export function getFieldConditions(fallback) {
  return safeGet('/advisory/field-conditions', fallback)
}
export function getAdvisoryAlerts(fallback) {
  return safeGet('/advisory/alerts', fallback)
}
export function getRecentScans(fallback) {
  return safeGet('/disease/scans?limit=10', fallback)
}
export function getMandiTrend(fallback) {
  return safeGet('/market/trend', fallback)
}
export function getMandiComparison(fallback) {
  return safeGet('/market/comparison', fallback)
}
export function getBuyers(fallback) {
  return safeGet('/market/buyers', fallback)
}
export function getHarvestWindow(fallback) {
  return safeGet('/market/harvest-window', fallback)
}
export function getNpkLevels(fallback) {
  return safeGet('/advisory/npk', fallback)
}
export function getIrrigationSchedule(fallback) {
  return safeGet('/advisory/irrigation', fallback)
}
export function getMoistureTrend(fallback) {
  return safeGet('/advisory/moisture-trend', fallback)
}

export async function sendChatMessage(message, history) {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    // Server sends a friendly `reply` even on failure (missing key, model down, etc.)
    // so the widget always has something sensible to show instead of a raw error.
    throw Object.assign(new Error(data.error || 'Chat request failed'), { reply: data.reply })
  }
  return data
}

export async function scanLeaf(file, crop) {
  const form = new FormData()
  form.append('image', file)
  form.append('crop', crop)
  const res = await fetch(`${API_BASE}/disease/scan`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Scan request failed')
  return res.json()
}

export const API_ONLINE_BASE = API_BASE
