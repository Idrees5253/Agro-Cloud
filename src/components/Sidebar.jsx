import { NavLink } from 'react-router-dom'
import { Sprout, ScanLine, Droplets, TrendingUp, Leaf } from 'lucide-react'
import { useLang } from '../i18n'

const items = [
  { to: '/', key: 'dashboard', icon: Sprout, end: true },
  { to: '/disease', key: 'disease', icon: ScanLine },
  { to: '/advisory', key: 'advisory', icon: Droplets },
  { to: '/market', key: 'market', icon: TrendingUp },
]

export default function Sidebar() {
  const { t } = useLang()
  return (
    <aside className="w-64 shrink-0 bg-ink text-paper-dim flex flex-col contour-bg">
      <div className="px-6 py-6 flex items-center gap-2 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-leaf flex items-center justify-center">
          <Leaf size={18} className="text-ink" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display font-semibold text-white leading-none">Agro-Cloud</p>
          <p className="text-[11px] text-white/40 mt-0.5 tracking-wide">SIH · FIELD TO MANDI</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={key}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-leaf/15 text-leaf-light font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {t(key)}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-[11px] text-white/35 leading-relaxed">
          Multi-modal AI · Offline-first · 4 languages
        </p>
      </div>
    </aside>
  )
}
