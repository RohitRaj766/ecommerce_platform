export function FlowBlock({ title, caption }) {
  return (
    <div className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-slate-700">{title?.charAt(0)}</div>
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        {caption && <p className="mt-1 text-xs text-slate-500">{caption}</p>}
      </div>
    </div>
  );
}
