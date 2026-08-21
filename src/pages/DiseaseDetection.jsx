import { useState, useRef, useEffect } from 'react'
import { UploadCloud, ScanLine, CheckCircle2, Leaf, WifiOff } from 'lucide-react'
import { useLang } from '../i18n'
import { recentScans as mockRecentScans } from '../data/mock'
import { scanLeaf, getRecentScans } from '../api'

const mockResults = [
  { disease: 'Early Blight', confidence: 91, severity: 'Medium',
    treatment: ['Remove and destroy affected lower leaves', 'Apply Mancozeb 75% WP @ 2.5g/L water', 'Avoid overhead irrigation, improve air circulation', 'Re-scan in 5 days to track spread'] },
  { disease: 'Leaf Rust', confidence: 86, severity: 'High',
    treatment: ['Apply Propiconazole 25% EC @ 1ml/L immediately', 'Isolate affected plot from irrigation runoff to healthy plots', 'Consider early harvest if >60% canopy affected', 'Notify nearby farms — rust spreads via wind-borne spores'] },
  { disease: 'Healthy', confidence: 97, severity: 'None',
    treatment: ['No intervention needed', 'Continue current irrigation and nutrient schedule', 'Next recommended scan in 10 days'] },
]

const severityColor = (severity) => {
  if (severity === 'High') return 'rust'
  if (severity === 'Medium' || severity === 'Low') return 'wheat'
  return 'leaf'
}

const crops = ['Cotton', 'Wheat', 'Tomato']

export default function DiseaseDetection() {
  const { t } = useLang()
  const [image, setImage] = useState(null)
  const [file, setFile] = useState(null)
  const [crop, setCrop] = useState('Cotton')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [offline, setOffline] = useState(false)
  const [scans, setScans] = useState(mockRecentScans)
  const inputRef = useRef(null)

  useEffect(() => {
    getRecentScans(mockRecentScans).then(setScans)
  }, [])

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setImage(URL.createObjectURL(f))
    setResult(null)
  }

  const analyze = async () => {
    setAnalyzing(true)
    setOffline(false)
    try {
      const data = await scanLeaf(file, crop)
      setResult({ ...data, color: severityColor(data.severity) })
      setScans(prev => [data, ...prev].slice(0, 10))
    } catch (err) {
      // Backend unreachable — fall back to local mock so the demo never stalls
      setOffline(true)
      await new Promise(r => setTimeout(r, 1200))
      const mock = mockResults[Math.floor(Math.random() * mockResults.length)]
      setResult({ ...mock, color: severityColor(mock.severity) })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Upload panel */}
        <div className="bg-paper rounded-2xl border border-paper-dim p-6">
          <h3 className="font-display font-semibold text-ink mb-1">{t('scanCrop')}</h3>
          <p className="text-sm text-ink/50 mb-4">{t('scanDesc')}</p>

          <div className="flex gap-2 mb-4">
            {crops.map(c => (
              <button
                key={c}
                onClick={() => setCrop(c)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  crop === c ? 'bg-leaf-dark text-white border-leaf-dark' : 'border-ink/15 text-ink/60 hover:border-ink/30'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]) }}
            className="border-2 border-dashed border-ink/15 rounded-xl h-64 flex items-center justify-center cursor-pointer hover:border-leaf hover:bg-leaf/5 transition-colors overflow-hidden"
          >
            {image ? (
              <img src={image} alt="leaf preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center px-6">
                <UploadCloud className="mx-auto mb-3 text-ink/30" size={32} />
                <p className="text-sm text-ink/50">{t('dragDrop')}</p>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

          <button
            onClick={analyze}
            disabled={!image || analyzing}
            className="w-full mt-4 bg-leaf-dark disabled:bg-ink/10 disabled:text-ink/30 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:bg-ink transition-colors"
          >
            <ScanLine size={17} />
            {analyzing ? 'Analyzing…' : t('analyze')}
          </button>
        </div>

        {/* Result panel */}
        <div className="bg-paper rounded-2xl border border-paper-dim p-6 flex flex-col">
          <h3 className="font-display font-semibold text-ink mb-4">Diagnosis</h3>
          {!result && !analyzing && (
            <div className="flex-1 flex items-center justify-center text-center text-ink/35 text-sm">
              <p>Upload and analyze a leaf photo<br/>to see AI diagnosis results here</p>
            </div>
          )}
          {analyzing && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-2 border-leaf border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-ink/45">Running multi-modal AI inference…</p>
            </div>
          )}
          {result && !analyzing && (
            <div className="flex-1 flex flex-col">
              {offline && (
                <div className="flex items-center gap-1.5 text-xs text-wheat mb-3 bg-wheat/10 rounded-lg px-2.5 py-1.5 w-fit">
                  <WifiOff size={12} /> Backend offline — showing local demo result
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                {result.disease === 'Healthy'
                  ? <CheckCircle2 className="text-leaf-dark" size={28} />
                  : <Leaf className="text-rust" size={28} />}
                <div>
                  <p className="font-display text-lg font-semibold text-ink">{result.disease}</p>
                  <p className="text-xs text-ink/45">Confidence <span className="font-mono">{result.confidence}%</span> · Severity {result.severity}</p>
                </div>
              </div>
              <div className="w-full bg-ink/5 rounded-full h-1.5 mb-6">
                <div
                  className={`h-1.5 rounded-full ${
                    result.color === 'wheat' ? 'bg-wheat' : result.color === 'rust' ? 'bg-rust' : 'bg-leaf'
                  }`}
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-2">Recommended Action</p>
              <ul className="space-y-2">
                {result.treatment.map((step, i) => (
                  <li key={i} className="text-sm text-ink/70 flex gap-2">
                    <span className="text-leaf-dark font-mono text-xs mt-0.5">{String(i+1).padStart(2,'0')}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="bg-paper rounded-2xl border border-paper-dim p-6">
        <h3 className="font-display font-semibold text-ink mb-4">{t('recentScans')}</h3>
        <div className="grid grid-cols-3 gap-4">
          {scans.map(s => (
            <div key={s.id} className="border border-paper-dim rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-ink text-sm">{s.crop}</span>
                <span className="text-xs text-ink/40">{typeof s.date === 'string' && s.date.includes('-') ? new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : s.date}</span>
              </div>
              <p className="text-sm text-ink/60">{s.disease}</p>
              <p className="font-mono text-xs text-ink/40 mt-1">{s.confidence}% confidence</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
