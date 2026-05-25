# Frontend Architecture Prototypes — Developer Guide

Repository: ecommerce_platform

Purpose
This repository contains a small set of frontend architecture prototypes and reference patterns. It is intended as a developer-facing guide that demonstrates production-minded techniques for server-state management, caching, optimistic mutations, request cancellation, infinite queries, RBAC, and a lightweight dashboard builder.

Goals
- Provide a clear, discoverable implementation of a reusable data layer built on TanStack Query.
- Demonstrate pragmatic production practices (cancellation, deduplication, retries, optimistic updates).
- Offer a reproducible demo environment using deterministic mock data for local validation.

Quick start (local)

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
# open http://localhost:3000
```

Build (production)

```bash
npm run build
npm run start
```

Recommended demo routes
- `/data-layer` — architecture overview, query lifecycle visualizations, infinite query demo, optimistic mutation demo.
- `/ecommerce` — product catalog, filters, product cards.
- `/rbac` — role/permission sandbox and UI gating examples.
- `/dashboard` — widget registry and builder.

Project layout (high level)
- `src/modules/data-layer` — the showcase page and demo components (flow diagram, lifecycle timeline, infinite-demo, mutation-demo).
- `src/shared/hooks` — `useApiQuery`, `useApiMutation` wrappers and shared hook patterns.
- `src/shared/services` — `api-client.js` central transport (dedupe, retries, abort signal support).
- `src/lib/query-client` + `src/providers` — `createQueryClient()` factory and client-only `QueryProvider`.
- `src/mock` — deterministic JSON seeds used by demos.

Data-layer deep dive

1) Query client and provider
- `src/lib/query-client/query-client.js` exports a `createQueryClient()` factory. The app instantiates the client on the browser inside `src/providers/query-provider.js` to avoid server-side singletons during Next.js prerendering.

Why this matters: QueryClient contains runtime defaults (e.g., retry policies, default stale times) and must be created in a client context when using Next.js App Router to prevent server-render/runtime mismatches.

2) Centralized API transport
- `src/shared/services/api-client.js` provides a small transport wrapper used by all services. It implements:
	- Request deduplication: avoid duplicate concurrent calls for the same resource.
	- Abort signal forwarding: hook into `fetch`/XHR to cancel requests when components unmount or queries become stale.
	- Retry logic: configurable retry attempts with basic backoff.

3) Reusable hooks
- `useApiQuery` — thin wrapper around TanStack's `useQuery` that enforces common defaults (error formatting, dedupe, query key patterns).
- `useApiMutation` — central mutation wrapper that standardizes `onMutate`, optimistic update patterns, rollback, and post-success invalidation.

4) Infinite queries
- The `infinite-demo` showcases `useInfiniteQuery` using `getNextPageParam` and local mock pagination. It demonstrates loading more pages, handling empty states, and coordinating UI with the cache.

5) Optimistic mutations
- The `mutation-demo` shows an optimistic add flow: mutate local cache immediately, perform network request, then either confirm (keep cache) or rollback on failure. The demo includes a toggle to simulate failures so you can observe rollback behavior.

Coding conventions and patterns
- Deterministic query keys: always use stable, serializable keys (arrays) to avoid cache collisions.
- Prefer invalidation for coarse refreshes and direct cache edits for precise low-latency UX (optimistic updates).
- Keep transport concerns (retries, signals) in `api-client` and business logic in services under `modules/*/services`.

Tests & verification
- The app uses deterministic mock data; manual smoke tests are the fastest way to validate changes:

```bash
npm run dev
# visit /data-layer, /ecommerce, /rbac
```

Production notes
- Observability: add tracing and request-level metrics (latency, retry counts, cache hit/miss).
- Server push: consider WebSocket or SSE for low-latency invalidation rather than aggressive refetching.
- Caching & CDNs: move idempotent read-heavy endpoints behind edge caches and use short cache-control with cache invalidation on write operations.
- Reliability: classify errors for retry/backoff and add circuit-breakers for unstable upstreams.

Files to inspect first (developer walkthrough)
- `src/shared/services/api-client.js` — transport policies and abort handling
- `src/lib/query-client/query-client.js` and `src/providers/query-provider.js` — how the QueryClient is created and provided
- `src/shared/hooks/use-api-query.js` and `src/shared/hooks/use-api-mutation.js` — hook abstractions
- `src/modules/data-layer/components` — demo implementations and UI primitives

Contributing
- Follow existing code style and small-file changes. Create focused PRs with a short description and a screenshot or steps to reproduce behavior.

Maintainers
- Primary author/maintainer: repository owner (see Git history for exact contact).

License
- No license file included; add a `LICENSE` if you intend to open-source this work.

Thank you
