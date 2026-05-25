"use client";

const points = [36, 48, 44, 60, 58, 70, 66];

export function TrafficWidget() {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">Traffic</p>
      <div className="mt-4 flex items-end gap-2">
        {points.map((point, index) => (
          <div key={index} className="flex-1 rounded-t-lg bg-sky-500/80" style={{ height: `${point}px` }} />
        ))}
      </div>
    </div>
  );
}