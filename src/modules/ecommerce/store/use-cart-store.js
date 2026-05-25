import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => ({
          items: state.items.some((item) => item.id === product.id)
            ? state.items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
            : [...state.items, { ...product, quantity: 1 }],
        })),
      incrementItem: (productId) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)),
        })),
      decrementItem: (productId) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.id !== productId) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "ecommerce-cart" }
  )
);