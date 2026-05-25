"use client";

import { useInfiniteQuery } from '@tanstack/react-query';
import products from '@/mock/products.json';
import { Button } from '@/shared/ui/button';

const PAGE_SIZE = 5;

function fetchPage({ pageParam = 0 }) {
  const start = pageParam * PAGE_SIZE;
  const slice = products.slice(start, start + PAGE_SIZE);
  return new Promise((res) => setTimeout(() => res({ items: slice, next: slice.length === PAGE_SIZE ? pageParam + 1 : undefined }), 300));
}

export function InfiniteDemo() {
  const q = useInfiniteQuery({
    queryKey: ['infinite:products'],
    queryFn: fetchPage,
    getNextPageParam: (last) => last.next,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-900">Infinite query demo</p>
        <div className="text-xs text-slate-500">Pages: {q.data?.pages.length ?? 0}</div>
      </div>

      <div className="grid gap-2">
        {q.data?.pages.flatMap((p) => p.items).map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <div className="font-medium text-slate-900">{p.title}</div>
            <div className="text-xs text-slate-500">{p.category}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => q.fetchNextPage()} disabled={!q.hasNextPage || q.isFetchingNextPage}>
          Load more
        </Button>
        <Button variant="ghost" onClick={() => q.refetch()}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
