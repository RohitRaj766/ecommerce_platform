import products from "@/mock/products.json";
import { requestMock } from "@/shared/services/api-client";

export function fetchProducts({ signal } = {}) {
  return requestMock("products:list", () => products, { delay: 400, signal, retries: 1 });
}