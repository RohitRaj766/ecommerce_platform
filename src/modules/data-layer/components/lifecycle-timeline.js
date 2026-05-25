"use client";

import { useEffect, useState } from 'react';

export function LifecycleTimeline({ query }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const state = query.status; // 'idle' | 'loading' | 'success' | 'error'
    setEvents((e) => [...e, { time: Date.now(), state }].slice(-8));
  }, [query.status, query.isFetching]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-900">Query lifecycle</p>
      <div className="flex flex-col gap-2">
        {events.map((ev, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <div className="text-slate-700">{ev.state}</div>
            <div className="text-xs text-slate-400">{new Date(ev.time).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
