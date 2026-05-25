import products from "@/mock/products.json";
import { requestMock, updateMock } from "@/shared/services/api-client";

let catalog = products;

const couponDiscounts = {
  SAVE10: 10,
  SAVE20: 20,
  BUYMORE: 15,
};

export function fetchCatalog({ signal } = {}) {
  return requestMock("ecommerce:catalog", () => catalog, { delay: 400, signal, retries: 1 });
}

export function createProduct(product) {
  return updateMock(() => {
    const nextProduct = { ...product, id: product.id ?? Date.now() };
    catalog = [nextProduct, ...catalog];
    return {
      message: "Product added successfully.",
      product: nextProduct,
      catalog,
    };
  }, { delay: 500 });
}

export function updateProduct(product) {
  return updateMock(() => {
    catalog = catalog.map((item) => (item.id === product.id ? product : item));
    return {
      message: "Product updated successfully.",
      product,
      catalog,
    };
  }, { delay: 500 });
}

export function deleteProduct(productId) {
  return updateMock(() => {
    catalog = catalog.filter((item) => item.id !== productId);
    return {
      message: "Product deleted successfully.",
      productId,
      catalog,
    };
  }, { delay: 500 });
}

export function applyCouponCode({ code, total, signal } = {}) {
  const normalizedCode = code?.trim().toUpperCase();

  return requestMock(
    `ecommerce:coupon:${normalizedCode ?? "empty"}`,
    () => {
      const discount = couponDiscounts[normalizedCode] ?? 0;
      return {
        code: normalizedCode,
        discount,
        applied: discount > 0,
        message: discount > 0 ? `Coupon ${normalizedCode} applied.` : `Coupon ${normalizedCode ?? ""} is invalid.`,
        totalAfterDiscount: total - Math.round((total * discount) / 100),
      };
    },
    { delay: 700, signal, retries: 0 }
  );
}

export function simulatePaymentDecision({ outcome, total, couponCode, signal } = {}) {
  return requestMock(
    `ecommerce:payment:${outcome}`,
    () => ({
      outcome,
      total,
      couponCode,
      message: outcome === "success" ? "Payment completed successfully." : "Payment failed. Please try again.",
    }),
    { delay: 2000, signal, retries: 0 }
  );
}
