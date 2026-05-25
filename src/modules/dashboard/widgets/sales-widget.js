"use client";

export function SalesWidget() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Sales</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">$24.8k</p>
      </div>
      <p className="text-sm text-emerald-600">+12% from last week</p>
    </div>
  );
}