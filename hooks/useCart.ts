import { create } from 'zustand';

export type CartItem = {
  product_id: number;
  product_name: string;
  product_ref: string; // ✅ AJOUT ICI
  supplier_id: number;
  supplier_name: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (product_id: number) => void;
  updateQuantity: (product_id: number, quantity: number) => void;
  clearCart: () => void;
};

export const useCart = create<CartStore>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i) => i.product_id === item.product_id,
      );

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          ),
        };
      }

      return { items: [...state.items, item] };
    }),

  removeItem: (product_id) =>
    set((state) => ({
      items: state.items.filter((i) => i.product_id !== product_id),
    })),

  updateQuantity: (product_id, quantity) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.product_id === product_id ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0), // 🔥 IMPORTANT
    })),

  clearCart: () => set({ items: [] }),
}));
