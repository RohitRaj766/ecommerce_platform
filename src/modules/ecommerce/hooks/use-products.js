"use client";

import { useApiQuery } from "@/shared/hooks/use-api-query";
import { fetchProducts } from "@/modules/ecommerce/services/product-service";

export function useProducts() {
  return useApiQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}