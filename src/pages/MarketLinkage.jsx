import { useState, useEffect } from 'react'
import { useLang } from '../i18n'
import { mandiTrend as mockTrend, mandiComparison as mockComparison, matchedBuyers as mockBuyers, harvestWindow as mockHarvestWindow } from '../data/mock'
import { getMandiTrend, getMandiComparison, getBuyers, getHarvestWindow } from '../api'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Phone, Calendar } from 'lucide-react'

export default function MarketLinkage() {
  const { t } = useLang()
  const [mandiTrend, setMandiTrend] = useState(mockTrend)
  const [mandiComparison, setMandiComparison] = useState(mockComparison)
  const [matchedBuyers, setMatchedBuyers] = useState(mockBuyers)
  const [harvestWindow, setHarvestWindow] = useState(mockHarvestWindow)

  useEffect(() => {
    getMandiTrend(mockTrend).then(setMandiTrend)
    getMandiComparison(mockComparison).then(setMandiComparison)
    getBuyers(mockBuyers).then(setMatchedBuyers)
    getHarvestWindow(mockHarvestWindow).then(setHarvestWindow)
  }, [])

  return (
    <div className="p-8 space-y-6">
      {/* Harvest window banner */}
      <div className="bg-wheat/10 border border-wheat/30 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-full bg-wheat/20 flex items-center justify-center shrink-0">
          <Calendar size={20} className="text-wheat" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{t('harvestWindow')} — {harvestWindow.crop}</p>
          <p className="text-xs text-ink/60 mt-0.5">
            <span className="font-mono">{harvestWindow.windowStart} – {harvestWindow.windowEnd}</span> · {harvestWindow.note}
          </p>
        </div>
      </div>

      {/* Price trend chart */}
      <div className="bg-paper rounded-2xl border border-paper-dim p-6">
        <h3 className="font-display font-semibold text-ink mb-1">{t('mandiTrend')}</h3>
        <p className="text-xs text-ink/45 mb-4">₹ per quintal, last 7 days across tracked crops</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mandiTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#14201799' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#14201799' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #EDE7D6' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="wheat" stroke="#E8A33D" strokeWidth={2.5} dot={false} name="Wheat" />
              <Line type="monotone" dataKey="cotton" stroke="#3F6B33" strokeWidth={2.5} dot={false} name="Cotton" />
              <Line type="monotone" dataKey="tomato" stroke="#C1502E" strokeWidth={2.5} dot={false} name="Tomato" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Mandi comparison */}
        <div className="bg-paper rounded-2xl border border-paper-dim p-6">
          <h3 className="font-display font-semibold text-ink mb-4">Nearby Mandi Comparison</h3>
          <div className="space-y-3">
            {mandiComparison.map((m, i) => (
              <div key={i} className="flex items-center justify-between border-b border-paper-dim last:border-0 pb-3 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-ink">{m.mandi}</p>
                  <p className="text-xs text-ink/45">{m.crop} · {m.distance} away</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-semibold text-ink">₹{m.price.toLocaleString('en-IN')}</span>
                  {m.trend === 'up'
                    ? <TrendingUp size={14} className="text-leaf-dark" />
                    : <TrendingDown size={14} className="text-rust" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matched buyers */}
        <div className="bg-paper rounded-2xl border border-paper-dim p-6">
          <h3 className="font-display font-semibold text-ink mb-4">{t('buyers')}</h3>
          <div className="space-y-3">
            {matchedBuyers.map(b => (
              <div key={b.id} className="border border-paper-dim rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{b.name}</p>
                  <p className="text-xs text-ink/45">{b.crop} · {b.qty} · {b.logistics}</p>
                  <p className="font-mono text-xs text-leaf-dark mt-1">{b.offer}</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-leaf-dark text-white flex items-center justify-center shrink-0 hover:bg-ink transition-colors">
                  <Phone size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
