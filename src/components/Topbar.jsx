import { Bell, MapPin, Globe } from 'lucide-react'
import { useLang } from '../i18n'

export default function Topbar({ title }) {
  const { t, toggle, langToggleLabel } = useLang()
  return (
    <header className="h-16 shrink-0 bg-paper border-b border-paper-dim flex items-center justify-between px-8">
      <div>
        <h1 className="font-display font-semibold text-lg text-ink">{title}</h1>
        <div className="flex items-center gap-1 text-xs text-ink/45 mt-0.5">
          <MapPin size={12} />
          <span>Ujjain, Madhya Pradesh</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 text-sm font-medium text-ink/70 hover:text-ink border border-ink/10 rounded-full px-3 py-1.5 transition-colors"
        >
          <Globe size={14} />
          {t('langToggle')}
        </button>
        <button className="relative w-9 h-9 rounded-full border border-ink/10 flex items-center justify-center text-ink/60 hover:text-ink transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-rust" />
        </button>
        <div className="w-9 h-9 rounded-full bg-leaf-dark text-white flex items-center justify-center font-display text-sm font-semibold">
          RK
        </div>
      </div>
    </header>
  )
}
