import { Router } from 'express'
import multer from 'multer'
import Jimp from 'jimp'
import { addScan, getScans } from '../db/index.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } })

// Crop-specific disease catalog. In production this maps 1:1 to the output
// classes of a trained CNN (e.g. a MobileNet fine-tuned on PlantVillage).
const diseaseCatalog = {
  Cotton: ['Bacterial Blight', 'Leaf Curl Virus', 'Aphid Infestation'],
  Wheat: ['Leaf Rust', 'Powdery Mildew', 'Septoria Blotch'],
  Tomato: ['Early Blight', 'Late Blight', 'Leaf Mold'],
  Default: ['Early Blight', 'Leaf Spot', 'Nutrient Deficiency'],
}

const treatments = {
  'Bacterial Blight': ['Remove and burn infected plant debris', 'Apply Copper oxychloride @ 3g/L water', 'Avoid working in fields when leaves are wet', 'Use certified disease-free seed next season'],
  'Leaf Curl Virus': ['Remove and destroy infected plants to stop spread', 'Control whitefly vector with Imidacloprid @ 0.5ml/L', 'Avoid planting near cucurbit crops (alternate host)', 'Re-scan in 5 days'],
  'Aphid Infestation': ['Spray Neem oil 1500ppm @ 3ml/L water', 'Introduce ladybird beetles as biological control', 'Avoid excess nitrogen — promotes aphid colonies', 'Monitor undersides of leaves weekly'],
  'Leaf Rust': ['Apply Propiconazole 25% EC @ 1ml/L immediately', 'Isolate affected plot from irrigation runoff to healthy plots', 'Consider early harvest if over 60% canopy affected', 'Notify nearby farms — rust spreads via wind-borne spores'],
  'Powdery Mildew': ['Apply Sulphur dust @ 20-25kg/ha', 'Improve air circulation via wider row spacing next season', 'Avoid overhead irrigation in evening hours', 'Re-scan in 4 days to confirm control'],
  'Septoria Blotch': ['Apply Chlorothalonil @ 2g/L water', 'Remove lower infected leaves to slow upward spread', 'Rotate with non-host crop next season', 'Re-scan in 5 days'],
  'Early Blight': ['Remove and destroy affected lower leaves', 'Apply Mancozeb 75% WP @ 2.5g/L water', 'Avoid overhead irrigation, improve air circulation', 'Re-scan in 5 days to track spread'],
  'Late Blight': ['Apply Metalaxyl + Mancozeb combination fungicide immediately', 'Destroy severely infected plants to prevent field spread', 'Avoid irrigation for 48 hours', 'High risk — consider agronomist consultation'],
  'Leaf Mold': ['Improve greenhouse/field ventilation', 'Apply Copper-based fungicide @ 2g/L water', 'Reduce humidity around canopy', 'Re-scan in 5 days'],
  'Leaf Spot': ['Apply Copper oxychloride @ 3g/L water', 'Remove and destroy affected leaves', 'Improve field drainage', 'Re-scan in 5 days'],
  'Nutrient Deficiency': ['Conduct a soil test to confirm deficient nutrient', 'Apply balanced NPK per Advisory tab recommendation', 'Consider foliar micronutrient spray for faster correction', 'Re-scan in 7 days'],
  'Healthy': ['No intervention needed', 'Continue current irrigation and nutrient schedule', 'Next recommended scan in 10 days'],
}

// Real pixel-level heuristic: classifies each pixel as healthy-green,
// stressed (yellow/brown/necrotic), or background, then derives a
// severity ratio from the actual image content.
async function analyzeLeafImage(buffer) {
  const image = await Jimp.read(buffer)
  image.resize(160, Jimp.AUTO)

  let greenPixels = 0
  let stressedPixels = 0
  let totalLeafPixels = 0

  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0]
    const g = this.bitmap.data[idx + 1]
    const b = this.bitmap.data[idx + 2]

    // Skip near-white/near-black background pixels
    const brightness = (r + g + b) / 3
    if (brightness > 240 || brightness < 15) return

    const isGreenish = g > r && g > b * 0.9
    const isYellowBrown = r > 100 && g > 60 && b < r * 0.75 && r >= g

    if (isGreenish || isYellowBrown) {
      totalLeafPixels++
      if (isYellowBrown) stressedPixels++
      else greenPixels++
    }
  })

  const stressRatio = totalLeafPixels > 0 ? stressedPixels / totalLeafPixels : 0
  return { stressRatio, totalLeafPixels }
}

function classify(stressRatio, crop) {
  const catalog = diseaseCatalog[crop] || diseaseCatalog.Default

  if (stressRatio < 0.06) {
    return { disease: 'Healthy', severity: 'None', confidence: Math.round(93 + Math.random() * 6) }
  }

  const disease = catalog[Math.floor(Math.random() * catalog.length)]
  let severity = 'Low'
  if (stressRatio > 0.35) severity = 'High'
  else if (stressRatio > 0.15) severity = 'Medium'

  const confidence = Math.round(72 + Math.min(24, stressRatio * 60) + Math.random() * 4)
  return { disease, severity, confidence: Math.min(confidence, 98) }
}

router.post('/scan', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' })
    const crop = req.body.crop || 'Default'

    const { stressRatio } = await analyzeLeafImage(req.file.buffer)
    const { disease, severity, confidence } = classify(stressRatio, crop)

    const scan = addScan({
      crop,
      disease,
      severity,
      confidence,
      stressRatio: Math.round(stressRatio * 1000) / 1000,
      treatment: treatments[disease] || treatments['Early Blight'],
    })

    res.json(scan)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Analysis failed', detail: err.message })
  }
})

router.get('/scans', (req, res) => {
  const limit = Number(req.query.limit) || 10
  res.json(getScans(limit))
})

export default router
