"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { useRecords } from "@/modules/data-layer/hooks/use-records";

export function DataLayerPage() {
  const { query, mutation } = useRecords();
  const [title, setTitle] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const visibleRecords = useMemo(() => {
    return (query.data ?? []).filter((record) => (statusFilter === "all" ? true : record.status === statusFilter));
  }, [query.data, statusFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Reusable Data Fetching Layer</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Query and mutation abstractions in one place</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              The shared hooks handle caching, retries, deduplication, cancellation via the React Query signal, and optimistic update flow.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Loaded</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{query.data?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fetching</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{String(query.isFetching)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Updated</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{query.dataUpdatedAt ? "Yes" : "No"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mutation</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{mutation.isPending ? "Busy" : "Idle"}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_auto]">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Add a new record" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400"
          >
            <option value="all">All statuses</option>
            <option value="todo">Todo</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
          </select>
          <Button
            onClick={() => {
              if (!title.trim()) return;
              mutation.mutate({ title: title.trim() });
              setTitle("");
            }}
          >
            Add
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
          <span>Loading: {String(query.isLoading)}</span>
          <span>| Error: {query.error ? "yes" : "no"}</span>
          <span>| Fetching: {String(query.isFetching)}</span>
          <span>| Retry enabled in query client</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => query.refetch()}>
            Refetch data
          </Button>
          <Button variant="ghost" onClick={() => setStatusFilter("all")}>
            Clear filter
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {visibleRecords.map((record) => (
          <Card key={record.id}>
            <p className="text-sm font-medium text-slate-950">{record.title}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{record.status}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Why this layer is reusable</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">useApiQuery</p>
            <p className="mt-2 text-sm text-slate-600">One hook for cache keys, retries, cancellation, and selectors.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">useApiMutation</p>
            <p className="mt-2 text-sm text-slate-600">One hook for optimistic writes, rollback, and invalidation.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">API client</p>
            <p className="mt-2 text-sm text-slate-600">Central place for mock latency, deduplication, and abort signals.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}