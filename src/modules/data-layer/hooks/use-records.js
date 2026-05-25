"use client";

import { useApiMutation } from "@/shared/hooks/use-api-mutation";
import { useApiQuery } from "@/shared/hooks/use-api-query";
import { createRecord, fetchRecords } from "@/modules/data-layer/services/resource-service";

export function useRecords() {
  const query = useApiQuery({
    queryKey: ["records"],
    queryFn: fetchRecords,
  });

  const mutation = useApiMutation({
    mutationFn: ({ title }) => createRecord(title),
    invalidateKeys: [["records"]],
    onOptimisticUpdate: (queryClient, variables) => {
      const currentRecords = queryClient.getQueryData(["records"]) ?? [];
      queryClient.setQueryData(["records"], [{ id: "optimistic", title: variables.title, status: "todo" }, ...currentRecords]);
    },
  });

  return { query, mutation };
}