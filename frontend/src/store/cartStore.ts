import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CartState {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, "cantidad">) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

// Carrito del cliente: estado del cliente, no del servidor. persist lo guarda en
// localStorage, así sobrevive a una recarga. El stock real lo valida el backend al confirmar.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Si el producto ya está en el carrito, suma una unidad en lugar de repetirlo
      agregar: (item) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === item.producto_id);
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, cantidad: 1 }] };
        }),

      quitar: (producto_id) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== producto_id) })),

      // Una cantidad menor a 1 saca el producto del carrito
      cambiarCantidad: (producto_id, cantidad) =>
        set((state) => ({
          items:
            cantidad < 1
              ? state.items.filter((i) => i.producto_id !== producto_id)
              : state.items.map((i) => (i.producto_id === producto_id ? { ...i, cantidad } : i)),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
    }),
    { name: "cart-storage" },
  ),
);
