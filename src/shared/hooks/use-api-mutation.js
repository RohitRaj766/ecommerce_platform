"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useApiMutation({ mutationFn, invalidateKeys = [], onOptimisticUpdate }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      const previousSnapshots = [];

      for (const queryKey of invalidateKeys) {
        await queryClient.cancelQueries({ queryKey });
        previousSnapshots.push([queryKey, queryClient.getQueryData(queryKey)]);
      }

      if (onOptimisticUpdate) {
        onOptimisticUpdate(queryClient, variables);
      }

      return { previousSnapshots };
    },
    onError: (_error, _variables, context) => {
      context?.previousSnapshots?.forEach(([queryKey, snapshot]) => {
        queryClient.setQueryData(queryKey, snapshot);
      });
    },
    onSettled: async () => {
      for (const queryKey of invalidateKeys) {
        await queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}