import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { sendChatMessage } from '../api'
import { useLang } from '../i18n'

const GREETING = {
  en: "Hi! I'm your Agro-Cloud AI assistant. Ask me about your crops, soil, irrigation, or mandi prices.",
  hi: 'नमस्ते! मैं आपका Agro-Cloud AI सहायक हूं। अपनी फ़सल, मिट्टी, सिंचाई या मंडी भाव के बारे में पूछें।',
}

export default function ChatWidget() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: GREETING[lang] || GREETING.en }])
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    try {
      // Send prior turns as history (excluding the greeting) so the model has context
      const history = nextMessages
        .slice(0, -1)
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }))
      const data = await sendChatMessage(text, history)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err.reply || "Sorry, I couldn't reach the AI assistant right now." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[520px] max-h-[70vh] bg-paper rounded-2xl border border-paper-dim shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="bg-ink px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-leaf flex items-center justify-center">
                <Sparkles size={14} className="text-ink" />
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-white leading-none">AI Advisory Assistant</p>
                <p className="text-[11px] text-white/40 mt-0.5">Ask about crops, soil, market</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-leaf-dark text-white rounded-br-sm'
                      : 'bg-ink/5 text-ink rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-ink/5 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink/30 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink/30 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-ink/30 animate-bounce" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-paper-dim p-3 flex items-end gap-2 shrink-0">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your crop, soil, market…"
              rows={1}
              className="flex-1 resize-none bg-ink/5 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-leaf/40 max-h-24"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-10 h-10 shrink-0 rounded-xl bg-leaf-dark disabled:bg-ink/10 disabled:text-ink/30 text-white flex items-center justify-center hover:bg-ink transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-leaf-dark text-white shadow-xl flex items-center justify-center hover:bg-ink transition-colors z-50"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  )
}
