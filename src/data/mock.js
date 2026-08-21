export const fieldConditions = {
  temp: { value: 31, unit: '°C', delta: '+2.1 vs avg' },
  humidity: { value: 64, unit: '%', delta: '-3 vs avg' },
  moisture: { value: 42, unit: '%', delta: '-8 vs ideal' },
  rain: { value: 6, unit: 'mm', delta: 'light showers' },
}

export const healthScore = {
  overall: 78,
  soil: 71,
  water: 58,
  diseaseFree: 92,
  yieldForecast: 84,
}

export const advisoryAlerts = [
  { id: 1, level: 'high', crop: 'Cotton', title: 'Irrigation deficit detected', desc: 'Soil moisture 8% below optimal for boll development stage. Irrigate within 48h.' },
  { id: 2, level: 'medium', crop: 'Tomato', title: 'Early blight risk rising', desc: 'Humidity + leaf-wetness pattern matches early blight onset conditions.' },
  { id: 3, level: 'low', crop: 'Wheat', title: 'Nitrogen top-dressing due', desc: 'Tillering stage window opens in 3 days for second N split.' },
]

export const mandiTrend = [
  { day: 'Mon', wheat: 2140, cotton: 6650, tomato: 1820 },
  { day: 'Tue', wheat: 2155, cotton: 6700, tomato: 1760 },
  { day: 'Wed', wheat: 2130, cotton: 6820, tomato: 1690 },
  { day: 'Thu', wheat: 2170, cotton: 6790, tomato: 1980 },
  { day: 'Fri', wheat: 2190, cotton: 6900, tomato: 2050 },
  { day: 'Sat', wheat: 2205, cotton: 6950, tomato: 2140 },
  { day: 'Sun', wheat: 2220, cotton: 7010, tomato: 2210 },
]

export const recentScans = [
  { id: 1, crop: 'Tomato', disease: 'Early Blight', confidence: 91, severity: 'Medium', date: '20 Aug' },
  { id: 2, crop: 'Cotton', disease: 'Healthy', confidence: 97, severity: '—', date: '19 Aug' },
  { id: 3, crop: 'Wheat', disease: 'Leaf Rust', confidence: 86, severity: 'High', date: '18 Aug' },
]

export const npkLevels = [
  { name: 'Nitrogen (N)', current: 45, recommended: 70, unit: 'kg/ha' },
  { name: 'Phosphorus (P)', current: 38, recommended: 40, unit: 'kg/ha' },
  { name: 'Potassium (K)', current: 52, recommended: 65, unit: 'kg/ha' },
]

export const irrigationSchedule = [
  { day: 'Today', action: 'Irrigate — 25mm', reason: 'Moisture below root-zone threshold' },
  { day: 'Wed', action: 'Skip', reason: 'Forecast rain 12mm expected' },
  { day: 'Fri', action: 'Irrigate — 18mm', reason: 'Post-rain deficit top-up' },
  { day: 'Mon', action: 'Monitor', reason: 'Flowering stage — sensor check only' },
]

export const soilMoistureTrend = [
  { day: 'Mon', moisture: 48 }, { day: 'Tue', moisture: 46 }, { day: 'Wed', moisture: 44 },
  { day: 'Thu', moisture: 41 }, { day: 'Fri', moisture: 42 }, { day: 'Sat', moisture: 39 },
  { day: 'Sun', moisture: 42 },
]

export const mandiComparison = [
  { mandi: 'Ujjain APMC', crop: 'Wheat', price: 2220, distance: '4 km', trend: 'up' },
  { mandi: 'Indore Choithram', crop: 'Wheat', price: 2260, distance: '58 km', trend: 'up' },
  { mandi: 'Dewas Mandi', crop: 'Wheat', price: 2190, distance: '32 km', trend: 'down' },
  { mandi: 'Ujjain APMC', crop: 'Cotton', price: 7010, distance: '4 km', trend: 'up' },
]

export const matchedBuyers = [
  { id: 1, name: 'Malwa Agro Traders', crop: 'Wheat', qty: '12 quintal', offer: '₹2,240/quintal', logistics: 'Pickup available' },
  { id: 2, name: 'Sanchi Foods Pvt Ltd', crop: 'Cotton', qty: '6 quintal', offer: '₹7,050/quintal', logistics: 'Self-transport, 15km' },
  { id: 3, name: 'FarmFresh Collective', crop: 'Tomato', qty: '3 quintal', offer: '₹22/kg', logistics: 'Pickup within 24h' },
]

export const harvestWindow = {
  crop: 'Wheat',
  windowStart: '2 Sep',
  windowEnd: '9 Sep',
  note: 'Forecast prices peak +4% in this window vs current spot rate.'
}
