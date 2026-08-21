import { useState, useEffect } from 'react'
import { useLang } from '../i18n'
import { npkLevels as mockNpk, irrigationSchedule as mockIrrigation, soilMoistureTrend as mockMoisture } from '../data/mock'
import { getNpkLevels, getIrrigationSchedule, getMoistureTrend } from '../api'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Droplets, CalendarClock, Bell } from 'lucide-react'

export default function Advisory() {
  const { t } = useLang()
  const [npkLevels, setNpkLevels] = useState(mockNpk)
  const [irrigationSchedule, setIrrigationSchedule] = useState(mockIrrigation)
  const [soilMoistureTrend, setSoilMoistureTrend] = useState(mockMoisture)

  useEffect(() => {
    getNpkLevels(mockNpk).then(setNpkLevels)
    getIrrigationSchedule(mockIrrigation).then(setIrrigationSchedule)
    getMoistureTrend(mockMoisture).then(setSoilMoistureTrend)
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* NPK */}
        <div className="bg-paper rounded-2xl border border-paper-dim p-6">
          <h3 className="font-display font-semibold text-ink mb-1">{t('npkTitle')}</h3>
          <p className="text-xs text-ink/45 mb-5">Current soil sensor reading vs. crop-stage recommendation</p>
          <div className="space-y-5">
            {npkLevels.map(n => {
              const pct = Math.min(100, (n.current / n.recommended) * 100)
              const deficit = n.recommended - n.current
              return (
                <div key={n.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-ink">{n.name}</span>
                    <span className="font-mono text-ink/60">{n.current} / {n.recommended} {n.unit}</span>
                  </div>
                  <div className="w-full bg-ink/5 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-leaf-dark" style={{ width: `${pct}%` }} />
                  </div>
                  {deficit > 0 && (
                    <p className="text-xs text-wheat mt-1">Apply {deficit} {n.unit} to reach target</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Irrigation schedule */}
        <div className="bg-paper rounded-2xl border border-paper-dim p-6">
          <h3 className="font-display font-semibold text-ink mb-1 flex items-center gap-2">
            <CalendarClock size={17} className="text-sky" /> {t('irrigation')}
          </h3>
          <p className="text-xs text-ink/45 mb-4">Auto-generated from moisture sensors + 7-day rain forecast</p>
          <div className="space-y-3">
            {irrigationSchedule.map((d, i) => (
              <div key={i} className="flex items-center justify-between border-b border-paper-dim last:border-0 pb-3 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-ink">{d.day}</p>
                  <p className="text-xs text-ink/45">{d.reason}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  d.action.startsWith('Irrigate') ? 'bg-sky/10 text-sky' :
                  d.action === 'Skip' ? 'bg-ink/5 text-ink/40' : 'bg-wheat/10 text-wheat'
                }`}>{d.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Moisture trend */}
      <div className="bg-paper rounded-2xl border border-paper-dim p-6">
        <h3 className="font-display font-semibold text-ink mb-1 flex items-center gap-2">
          <Droplets size={17} className="text-leaf-dark" /> Soil Moisture — 7 Day Trend
        </h3>
        <p className="text-xs text-ink/45 mb-4">Root-zone sensor average, plot 4B</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={soilMoistureTrend}>
              <defs>
                <linearGradient id="moist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6FA85A" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6FA85A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#14201799' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#14201799' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #EDE7D6' }} />
              <Area type="monotone" dataKey="moisture" stroke="#3F6B33" strokeWidth={2.5} fill="url(#moist)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Push notification preview */}
      <div className="bg-ink rounded-2xl p-6 contour-bg">
        <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
          <Bell size={16} className="text-leaf-light" /> Localized Advisory — Push Preview
        </h3>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-w-md">
          <p className="text-sm text-white font-medium mb-1">🌾 Irrigation Alert — Plot 4B</p>
          <p className="text-xs text-white/60">आपकी मिट्टी में नमी की कमी है। अगले 48 घंटों में सिंचाई करें। Soil moisture is 8% below optimal — irrigate within 48 hours.</p>
        </div>
      </div>
    </div>
  )
}
