import { api, pedir } from "@/shared/api/api";
import type { Categoria, CategoriaInput } from "../types/categoria.types";

// GET /categorias/ — listado (cualquier usuario autenticado)
export function getCategorias(): Promise<Categoria[]> {
  return pedir(api.get<Categoria[]>("/categorias/"), "No se pudieron cargar las categorías");
}

// POST /categorias/ — alta (solo admin)
export function crearCategoria(datos: CategoriaInput): Promise<Categoria> {
  return pedir(api.post<Categoria>("/categorias/", datos), "No se pudo crear la categoría");
}

// PUT /categorias/{id} — edición (solo admin)
export function actualizarCategoria(id: number, datos: CategoriaInput): Promise<Categoria> {
  return pedir(api.put<Categoria>(`/categorias/${id}`, datos), "No se pudo actualizar la categoría");
}

// DELETE /categorias/{id} — borrado lógico (solo admin)
export function eliminarCategoria(id: number): Promise<void> {
  return pedir(api.delete<void>(`/categorias/${id}`), "No se pudo eliminar la categoría");
}
