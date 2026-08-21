import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import diseaseRoutes from './routes/disease.js'
import advisoryRoutes from './routes/advisory.js'
import marketRoutes from './routes/market.js'
import farmerRoutes from './routes/farmers.js'
import chatRoutes from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'agro-cloud-server' }))

app.use('/api/disease', diseaseRoutes)
app.use('/api/advisory', advisoryRoutes)
app.use('/api/market', marketRoutes)
app.use('/api/farmers', farmerRoutes)
app.use('/api/chat', chatRoutes)

app.listen(PORT, () => {
  console.log(`Agro-Cloud API running on http://localhost:${PORT}`)
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('[chat] OPENROUTER_API_KEY not set — AI chatbot will respond with a "not configured" message. See server/.env.example')
  }
})
