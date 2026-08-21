import { Router } from 'express'
import { getScans, getAdvisoryAlerts, getNpkLevels, getHarvestWindow } from '../db/index.js'

const router = Router()

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
// 'openrouter/free' is OpenRouter's own auto-router: it picks a currently-live free
// model for you on every request, so this never breaks when a specific free model
// gets retired (which is what happened with llama-3.1-8b-instruct:free).
// Override with a specific model id via OPENROUTER_MODEL if you want a fixed one.
const DEFAULT_MODEL = 'openrouter/free'

function buildSystemPrompt() {
  // Ground the assistant in the farm's actual live data so answers feel
  // integrated with the rest of the app rather than a generic chatbot bolted on.
  const scans = getScans(3)
  const alerts = getAdvisoryAlerts()
  const npk = getNpkLevels()
  const harvest = getHarvestWindow()

  const scanSummary = scans.length
    ? scans.map(s => `${s.crop}: ${s.disease} (${s.severity ?? 'n/a'} severity, ${s.confidence ?? '?'}% confidence)`).join('; ')
    : 'No recent scans on file.'
  const alertSummary = alerts.length
    ? alerts.map(a => `[${a.level}] ${a.crop ?? ''}: ${a.title}`).join('; ')
    : 'No active alerts.'
  const npkSummary = npk.length
    ? npk.map(n => `${n.name}: ${n.current}/${n.recommended} ${n.unit ?? ''}`).join('; ')
    : 'No soil data on file.'
  const harvestSummary = harvest
    ? `${harvest.crop}, ${harvest.windowStart}-${harvest.windowEnd}: ${harvest.note ?? ''}`
    : 'No harvest window forecast on file.'

  return `You are the Agro-Cloud AI Advisory Assistant, built for smallholder farmers in India using this Smart Agriculture platform (disease detection, soil/irrigation advisory, and mandi market linkage).

Answer in short, plain, practical language — this is for a farmer on a mobile app, not an agronomist. Prefer concrete steps over generic advice. If asked about something outside farming/agriculture/this app, gently redirect back to what you can help with.

Current farm context you can reference naturally when relevant (do not dump all of it unless asked):
- Recent disease scans: ${scanSummary}
- Active advisory alerts: ${alertSummary}
- Soil NPK levels: ${npkSummary}
- Harvest window forecast: ${harvestSummary}`
}

router.post('/message', async (req, res) => {
  const { message, history } = req.body || {}
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error: 'OPENROUTER_API_KEY not configured on the server',
      reply: "The AI assistant isn't configured yet — ask whoever's running the backend to set OPENROUTER_API_KEY.",
    })
  }

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...(Array.isArray(history) ? history.slice(-10) : []),
    { role: 'user', content: message },
  ]

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter uses these for its public model rankings — harmless to include, not required.
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Agro-Cloud',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages,
        temperature: 0.4,
        max_tokens: 500,
        // Some free models route to reasoning-capable variants (DeepSeek/GLM-style)
        // that otherwise leak their internal "thinking" steps into the visible reply.
        // This tells OpenRouter to strip reasoning tokens from the response for any
        // model that supports the control (harmlessly ignored by models that don't).
        reasoning: { exclude: true },
      }),
      signal: AbortSignal.timeout(20000),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error(`[chat] OpenRouter error (model: ${process.env.OPENROUTER_MODEL || DEFAULT_MODEL})`, response.status, errText)
      return res.status(502).json({
        error: `OpenRouter responded ${response.status}`,
        reply: 'The AI assistant is temporarily unavailable. Please try again in a moment.',
      })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return res.status(502).json({ error: 'Empty response from model', reply: 'Sorry, I could not generate a response. Please try rephrasing your question.' })
    }

    res.json({ reply, model: data.model || process.env.OPENROUTER_MODEL || DEFAULT_MODEL })
  } catch (err) {
    console.error('[chat] request failed', err.message)
    res.status(500).json({ error: 'Chat request failed', detail: err.message, reply: 'Sorry, something went wrong reaching the AI assistant.' })
  }
})

export default router
