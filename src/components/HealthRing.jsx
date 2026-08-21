import { useLang } from '../i18n'

// Signature element: 4 concentric arcs = the 4 data streams the platform fuses
// (soil, water, disease-free %, yield outlook) into one composite score.
function ringPath(cx, cy, r, pct) {
  const angle = (pct / 100) * 359.999
  const start = -90
  const end = start + angle
  const toXY = (deg) => {
    const rad = (deg * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }
  const [x1, y1] = toXY(start)
  const [x2, y2] = toXY(end)
  const large = angle > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

export default function HealthRing({ overall, soil, water, diseaseFree, yieldForecast }) {
  const { t } = useLang()
  const rings = [
    { r: 88, pct: soil, color: '#8B5E34', label: t('soil') },
    { r: 72, pct: water, color: '#4A90A4', label: t('water') },
    { r: 56, pct: diseaseFree, color: '#6FA85A', label: t('diseaseFree') },
    { r: 40, pct: yieldForecast, color: '#E8A33D', label: t('yieldFc') },
  ]
  return (
    <div className="flex items-center gap-8">
      <svg viewBox="0 0 200 200" className="w-44 h-44 shrink-0">
        {rings.map((ring) => (
          <g key={ring.label}>
            <circle cx="100" cy="100" r={ring.r} fill="none" stroke="#ffffff22" strokeWidth="10" />
            <path
              d={ringPath(100, 100, ring.r, ring.pct)}
              fill="none"
              stroke={ring.color}
              strokeWidth="10"
              strokeLinecap="round"
            />
          </g>
        ))}
        <text x="100" y="94" textAnchor="middle" className="font-display" fontSize="34" fontWeight="700" fill="white">
          {overall}
        </text>
        <text x="100" y="116" textAnchor="middle" fontSize="11" fill="#ffffff99">
          / 100
        </text>
      </svg>
      <div className="space-y-2.5">
        {rings.map((ring) => (
          <div key={ring.label} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ring.color }} />
            <span className="text-sm text-white/70 w-28">{ring.label}</span>
            <span className="font-mono text-sm text-white font-medium">{ring.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
