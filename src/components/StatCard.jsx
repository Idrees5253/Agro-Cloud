export default function StatCard({ icon: Icon, label, value, unit, delta, accent = 'leaf' }) {
  const accentMap = {
    leaf: 'text-leaf-dark bg-leaf/10',
    wheat: 'text-wheat bg-wheat/10',
    sky: 'text-sky bg-sky/10',
    rust: 'text-rust bg-rust/10',
  }
  return (
    <div className="bg-paper rounded-2xl border border-paper-dim p-5">
      <div className="flex items-center justify-between mb-4">
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${accentMap[accent]}`}>
          <Icon size={17} strokeWidth={2} />
        </span>
      </div>
      <p className="text-xs text-ink/50 mb-1">{label}</p>
      <p className="font-mono text-2xl font-semibold text-ink">
        {value}<span className="text-sm text-ink/40 ml-0.5">{unit}</span>
      </p>
      <p className="text-[11px] text-ink/40 mt-1">{delta}</p>
    </div>
  )
}
