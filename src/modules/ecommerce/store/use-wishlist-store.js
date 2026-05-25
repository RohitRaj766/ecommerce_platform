import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set) => ({
      items: [],
      toggleItem: (product) =>
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          return {
            items: exists ? state.items.filter((item) => item.id !== product.id) : [...state.items, product],
          };
        }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.id !== productId) })),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: "ecommerce-wishlist" }
  )
);