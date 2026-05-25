"use client";

import { useQuery } from "@tanstack/react-query";

export function useApiQuery({ queryKey, queryFn, enabled = true, staleTime, retry, select }) {
  return useQuery({
    queryKey,
    queryFn: ({ signal }) => queryFn({ signal }),
    enabled,
    staleTime,
    retry,
    select,
  });
}