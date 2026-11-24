import { api, pedir } from "@/shared/api/api";
import type {
  FiltrosProductos,
  Producto,
  ProductoInput,
  ProductosPaginados,
  StockInput,
} from "../types/producto.types";

// Los textos opcionales vacíos se mandan como null
const aCuerpo = (datos: ProductoInput) => ({
  ...datos,
  descripcion: datos.descripcion.trim() || null,
  imagen_url: datos.imagen_url.trim() || null,
});

// GET /productos — solo activos, paginado en el servidor, con búsqueda y filtros (público)
export function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  return pedir(
    api.get<ProductosPaginados>("/productos", { params: filtros }),
    "No se pudieron cargar los productos",
  );
}

// POST /productos — alta (solo admin)
export function crearProducto(datos: ProductoInput): Promise<Producto> {
  return pedir(api.post<Producto>("/productos", aCuerpo(datos)), "No se pudo crear el producto");
}

// PUT /productos/{id} — edición (solo admin)
export function actualizarProducto(id: number, datos: ProductoInput): Promise<Producto> {
  return pedir(api.put<Producto>(`/productos/${id}`, aCuerpo(datos)), "No se pudo actualizar el producto");
}

// PATCH /productos/{id}/stock — solo stock y disponibilidad (solo admin)
export function actualizarStock(id: number, datos: StockInput): Promise<Producto> {
  return pedir(api.patch<Producto>(`/productos/${id}/stock`, datos), "No se pudo actualizar el stock");
}

// DELETE /productos/{id} — baja lógica (solo admin)
export function eliminarProducto(id: number): Promise<void> {
  return pedir(api.delete<void>(`/productos/${id}`), "No se pudo eliminar el producto");
}
