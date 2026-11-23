import { api, pedir } from "@/shared/api/api";
import type { Producto, ProductoInput } from "../types/producto.types";

// GET /productos/ — listado con las categorías de cada producto (cualquier usuario autenticado)
export function getProductos(): Promise<Producto[]> {
  return pedir(api.get<Producto[]>("/productos/"), "No se pudieron cargar los productos");
}

// POST /productos/ — alta (solo admin)
export function crearProducto(datos: ProductoInput): Promise<Producto> {
  return pedir(api.post<Producto>("/productos/", datos), "No se pudo crear el producto");
}

// PUT /productos/{id} — edición (solo admin)
export function actualizarProducto(id: number, datos: ProductoInput): Promise<Producto> {
  return pedir(api.put<Producto>(`/productos/${id}`, datos), "No se pudo actualizar el producto");
}

// DELETE /productos/{id} — borrado lógico (solo admin)
export function eliminarProducto(id: number): Promise<void> {
  return pedir(api.delete<void>(`/productos/${id}`), "No se pudo eliminar el producto");
}
