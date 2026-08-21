// Initial demo data — only inserted the first time the DB file is created.
export const seedData = {
  farmers: [
    { id: 'f1', name: 'Rakesh Kumar', village: 'Ujjain, Madhya Pradesh', primaryCrop: 'Cotton', plot: 'Plot 4B' },
  ],
  scans: [
    { id: 's1', crop: 'Tomato', disease: 'Early Blight', confidence: 91, severity: 'Medium', treatment: ['Remove and destroy affected lower leaves', 'Apply Mancozeb 75% WP @ 2.5g/L water', 'Avoid overhead irrigation, improve air circulation', 'Re-scan in 5 days to track spread'], date: '2026-08-20T10:00:00.000Z' },
    { id: 's2', crop: 'Cotton', disease: 'Healthy', confidence: 97, severity: 'None', treatment: ['No intervention needed', 'Continue current irrigation and nutrient schedule', 'Next recommended scan in 10 days'], date: '2026-08-19T10:00:00.000Z' },
    { id: 's3', crop: 'Wheat', disease: 'Leaf Rust', confidence: 86, severity: 'High', treatment: ['Apply Propiconazole 25% EC @ 1ml/L immediately', 'Isolate affected plot from irrigation runoff to healthy plots', 'Consider early harvest if over 60% canopy affected', 'Notify nearby farms — rust spreads via wind-borne spores'], date: '2026-08-18T10:00:00.000Z' },
  ],
  advisoryAlerts: [
    { level: 'high', crop: 'Cotton', title: 'Irrigation deficit detected', description: 'Soil moisture 8% below optimal for boll development stage. Irrigate within 48h.' },
    { level: 'medium', crop: 'Tomato', title: 'Early blight risk rising', description: 'Humidity + leaf-wetness pattern matches early blight onset conditions.' },
    { level: 'low', crop: 'Wheat', title: 'Nitrogen top-dressing due', description: 'Tillering stage window opens in 3 days for second N split.' },
  ],
  npkLevels: [
    { name: 'Nitrogen (N)', current: 45, recommended: 70, unit: 'kg/ha' },
    { name: 'Phosphorus (P)', current: 38, recommended: 40, unit: 'kg/ha' },
    { name: 'Potassium (K)', current: 52, recommended: 65, unit: 'kg/ha' },
  ],
  irrigationSchedule: [
    { day: 'Today', action: 'Irrigate — 25mm', reason: 'Moisture below root-zone threshold' },
    { day: 'Wed', action: 'Skip', reason: 'Forecast rain 12mm expected' },
    { day: 'Fri', action: 'Irrigate — 18mm', reason: 'Post-rain deficit top-up' },
    { day: 'Mon', action: 'Monitor', reason: 'Flowering stage — sensor check only' },
  ],
  soilMoistureTrend: [
    { day: 'Mon', moisture: 48 }, { day: 'Tue', moisture: 46 }, { day: 'Wed', moisture: 44 },
    { day: 'Thu', moisture: 41 }, { day: 'Fri', moisture: 42 }, { day: 'Sat', moisture: 39 },
    { day: 'Sun', moisture: 42 },
  ],
  mandiTrend: [
    { day: 'Mon', wheat: 2140, cotton: 6650, tomato: 1820 },
    { day: 'Tue', wheat: 2155, cotton: 6700, tomato: 1760 },
    { day: 'Wed', wheat: 2130, cotton: 6820, tomato: 1690 },
    { day: 'Thu', wheat: 2170, cotton: 6790, tomato: 1980 },
    { day: 'Fri', wheat: 2190, cotton: 6900, tomato: 2050 },
    { day: 'Sat', wheat: 2205, cotton: 6950, tomato: 2140 },
    { day: 'Sun', wheat: 2220, cotton: 7010, tomato: 2210 },
  ],
  mandiComparison: [
    { mandi: 'Ujjain APMC', crop: 'Wheat', price: 2220, distance: '4 km', trend: 'up' },
    { mandi: 'Indore Choithram', crop: 'Wheat', price: 2260, distance: '58 km', trend: 'up' },
    { mandi: 'Dewas Mandi', crop: 'Wheat', price: 2190, distance: '32 km', trend: 'down' },
    { mandi: 'Ujjain APMC', crop: 'Cotton', price: 7010, distance: '4 km', trend: 'up' },
  ],
  buyers: [
    { name: 'Malwa Agro Traders', crop: 'Wheat', qty: '12 quintal', offer: '₹2,240/quintal', logistics: 'Pickup available' },
    { name: 'Sanchi Foods Pvt Ltd', crop: 'Cotton', qty: '6 quintal', offer: '₹7,050/quintal', logistics: 'Self-transport, 15km' },
    { name: 'FarmFresh Collective', crop: 'Tomato', qty: '3 quintal', offer: '₹22/kg', logistics: 'Pickup within 24h' },
  ],
  harvestWindow: {
    crop: 'Wheat', windowStart: '2 Sep', windowEnd: '9 Sep',
    note: 'Forecast prices peak +4% in this window vs current spot rate.'
  }
}
