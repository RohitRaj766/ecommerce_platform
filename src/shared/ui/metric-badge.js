export function MetricBadge({ label, value, tone = 'default' }) {
  const toneClass = {
    default: 'bg-slate-50 text-slate-900',
    success: 'bg-emerald-50 text-emerald-700',
    warn: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
  }[tone];

  return (
    <div className={`inline-flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${toneClass}`}>
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold">{String(value)}</span>
    </div>
  );
}
