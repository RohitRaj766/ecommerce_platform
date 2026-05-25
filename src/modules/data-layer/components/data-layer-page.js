"use client";

import { useMemo } from "react";
import { OverviewCard } from "@/shared/ui/overview-card";
import { MetricBadge } from "@/shared/ui/metric-badge";
import { FlowDiagram } from "./flow-diagram";
import { LifecycleTimeline } from "./lifecycle-timeline";
import { InfiniteDemo } from "./infinite-demo";
import { MutationDemo } from "./mutation-demo";
import { useRecords } from "@/modules/data-layer/hooks/use-records";

export function DataLayerPage() {
  const { query } = useRecords();

  return (
    <div className="space-y-6">
      <OverviewCard title="Reusable Data Platform" subtitle="Professional-grade architecture showcase for server-state management">
        <div className="flex items-center justify-between gap-4">
          <p className="max-w-2xl text-sm text-slate-600">This module showcases a centralized API client, composable hooks, a deterministic cache lifecycle, optimistic mutation flows with rollback, request cancellation patterns, and an infinite-query example — packaged as a concise engineering artifact for interviews and demos.</p>
          <div className="flex items-center gap-2">
            <MetricBadge label="Cache Hit" value={query.isFetched ? 'yes' : 'no'} tone="success" />
            <MetricBadge label="Retry Enabled" value={'1'} />
            <MetricBadge label="Cancellation" value={'signal'} />
            <MetricBadge label="Deduplication" value={'active'} />
          </div>
        </div>
      </OverviewCard>

      <div className="grid gap-4 md:grid-cols-3">
        <OverviewCard title="Architecture overview">
          <FlowDiagram />
        </OverviewCard>

        <OverviewCard title="Query lifecycle">
          <LifecycleTimeline query={query} />
        </OverviewCard>

        <OverviewCard title="Cache system">
          <p className="text-sm text-slate-600">Query key: <span className="font-mono">['records']</span></p>
          <p className="mt-2 text-sm text-slate-600">Stale time: inherited from `queryClient` defaults. Use `invalidate` to refresh.</p>
        </OverviewCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <OverviewCard title="Infinite query demo">
          <InfiniteDemo />
        </OverviewCard>

        <OverviewCard title="Mutation system">
          <MutationDemo />
        </OverviewCard>
      </div>

      <OverviewCard title="Assignment mapping">
        <ul className="list-disc pl-5 text-sm text-slate-600">
          <li>Caching — `useApiQuery` + `queryClient`</li>
          <li>Retries — query defaults + request retry wrapper</li>
          <li>Cancellation — signal support in API client</li>
          <li>Optimistic updates — `useApiMutation` with onOptimisticUpdate</li>
          <li>Infinite queries — `useInfiniteQuery` demo</li>
        </ul>
      </OverviewCard>

      <OverviewCard title="Production considerations">
        <div className="grid gap-2 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-900">Observability</p>
            <p className="mt-1">Add tracing, metrics, and request instrumentation to understand cache hit/miss and error rates.</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Server Push</p>
            <p className="mt-1">Consider websocket or server-sent events for low-latency invalidation and realtime sync.</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Distributed caching & batching</p>
            <p className="mt-1">Use backend-level batching and CDN or edge-caching for scale-sensitive endpoints.</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Reliability</p>
            <p className="mt-1">Add circuit-breakers, backoff strategies, and better error classification for retries.</p>
          </div>
        </div>
      </OverviewCard>
    </div>
  );
}