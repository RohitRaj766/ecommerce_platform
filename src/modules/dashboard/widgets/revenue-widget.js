"use client";

export function RevenueWidget() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Revenue</p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">$38.2k</p>
      </div>
      <p className="text-sm text-sky-600">+8% from last month</p>
    </div>
  );
}