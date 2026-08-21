import { useState, useEffect } from 'react'
import { Thermometer, Droplet, CloudRain, Waves, ChevronRight, TriangleAlert } from 'lucide-react'
import { useLang } from '../i18n'
import StatCard from '../components/StatCard'
import HealthRing from '../components/HealthRing'
import { fieldConditions as mockFieldConditions, healthScore, advisoryAlerts as mockAlerts, mandiTrend, recentScans as mockRecentScans } from '../data/mock'
import { getFieldConditions, getAdvisoryAlerts, getRecentScans } from '../api'
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import { Link } from 'react-router-dom'

const levelStyles = {
  high: 'border-l-rust bg-rust/5 text-rust',
  medium: 'border-l-wheat bg-wheat/5 text-wheat',
  low: 'border-l-leaf-dark bg-leaf/5 text-leaf-dark',
}

export default function Dashboard() {
  const { t } = useLang()
  const [fieldConditions, setFieldConditions] = useState(mockFieldConditions)
  const [advisoryAlerts, setAdvisoryAlerts] = useState(mockAlerts)
  const [recentScans, setRecentScans] = useState(mockRecentScans)

  useEffect(() => {
    getFieldConditions(mockFieldConditions).then(setFieldConditions)
    getAdvisoryAlerts(mockAlerts).then(setAdvisoryAlerts)
    getRecentScans(mockRecentScans).then(setRecentScans)
  }, [])

  return (
    <div className="p-8 space-y-6">
      {/* Hero */}
      <div className="bg-ink rounded-2xl p-8 contour-bg relative overflow-hidden">
        <p className="text-white/50 text-sm mb-1">{t('welcome')}, Rakesh</p>
        <h2 className="font-display text-white text-xl font-semibold mb-6">{t('farmHealth')} — Plot 4B, Cotton</h2>
        <HealthRing
          overall={healthScore.overall}
          soil={healthScore.soil}
          water={healthScore.water}
          diseaseFree={healthScore.diseaseFree}
          yieldForecast={healthScore.yieldForecast}
        />
      </div>

      {/* Field conditions */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">{t('quickStats')}</h3>
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Thermometer} label={t('temp')} value={fieldConditions.temp.value} unit={fieldConditions.temp.unit} delta={fieldConditions.temp.delta} accent="rust" />
          <StatCard icon={Droplet} label={t('humidity')} value={fieldConditions.humidity.value} unit={fieldConditions.humidity.unit} delta={fieldConditions.humidity.delta} accent="sky" />
          <StatCard icon={Waves} label={t('moisture')} value={fieldConditions.moisture.value} unit={fieldConditions.moisture.unit} delta={fieldConditions.moisture.delta} accent="leaf" />
          <StatCard icon={CloudRain} label={t('rain')} value={fieldConditions.rain.value} unit={fieldConditions.rain.unit} delta={fieldConditions.rain.delta} accent="wheat" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="col-span-2 bg-paper rounded-2xl border border-paper-dim p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink">{t('alerts')}</h3>
            <Link to="/advisory" className="text-xs text-leaf-dark font-medium flex items-center gap-0.5 hover:gap-1.5 transition-all">
              {t('viewAll')} <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {advisoryAlerts.map(a => (
              <div key={a.id} className={`border-l-4 rounded-r-lg px-4 py-3 ${levelStyles[a.level]}`}>
                <div className="flex items-center gap-2 mb-1">
                  <TriangleAlert size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wide">{a.crop}</span>
                </div>
                <p className="text-sm font-medium text-ink">{a.title}</p>
                <p className="text-xs text-ink/55 mt-0.5">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mandi mini trend */}
        <div className="bg-paper rounded-2xl border border-paper-dim p-6">
          <h3 className="font-display font-semibold text-ink mb-1">{t('mandiTrend')}</h3>
          <p className="text-xs text-ink/45 mb-3">Wheat, ₹/quintal — 7 days</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mandiTrend}>
                <XAxis dataKey="day" hide />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #EDE7D6' }} />
                <Line type="monotone" dataKey="wheat" stroke="#6FA85A" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-baseline justify-between mt-2 pt-3 border-t border-paper-dim">
            <span className="font-mono text-xl font-semibold text-ink">₹2,220</span>
            <span className="text-xs font-medium text-leaf-dark">+3.7% this week</span>
          </div>
        </div>
      </div>

      {/* Recent scans */}
      <div className="bg-paper rounded-2xl border border-paper-dim p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ink">{t('recentScans')}</h3>
          <Link to="/disease" className="text-xs text-leaf-dark font-medium flex items-center gap-0.5 hover:gap-1.5 transition-all">
            {t('scanCrop')} <ChevronRight size={13} />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink/40 text-xs uppercase tracking-wide">
              <th className="pb-2 font-medium">Crop</th>
              <th className="pb-2 font-medium">Diagnosis</th>
              <th className="pb-2 font-medium">Confidence</th>
              <th className="pb-2 font-medium">Severity</th>
              <th className="pb-2 font-medium text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentScans.map(s => (
              <tr key={s.id} className="border-t border-paper-dim">
                <td className="py-2.5 font-medium text-ink">{s.crop}</td>
                <td className="py-2.5 text-ink/70">{s.disease}</td>
                <td className="py-2.5 font-mono text-ink/70">{s.confidence}%</td>
                <td className="py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.severity === 'High' ? 'bg-rust/10 text-rust' :
                    s.severity === 'Medium' ? 'bg-wheat/10 text-wheat' :
                    s.severity === '—' ? 'bg-leaf/10 text-leaf-dark' : 'bg-ink/5 text-ink/50'
                  }`}>{s.severity}</span>
                </td>
                <td className="py-2.5 text-right text-ink/45">
                  {typeof s.date === 'string' && s.date.includes('-') && s.date.length > 8
                    ? new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : s.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
