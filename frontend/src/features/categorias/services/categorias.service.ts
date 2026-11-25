import { api, pedir } from "@/shared/api/api";
import type { Categoria, CategoriaInput } from "../types/categoria.types";

// Una descripción vacía se manda como null: la columna es opcional
const aCuerpo = ({ nombre, descripcion }: CategoriaInput) => ({
  nombre,
  descripcion: descripcion.trim() || null,
});

// GET /categorias — solo las activas (público)
export function getCategorias(): Promise<Categoria[]> {
  return pedir(api.get<Categoria[]>("/categorias"), "No se pudieron cargar las categorías");
}

// POST /categorias — alta (solo admin)
export function crearCategoria(datos: CategoriaInput): Promise<Categoria> {
  return pedir(api.post<Categoria>("/categorias", aCuerpo(datos)), "No se pudo crear la categoría");
}

// PUT /categorias/{id} — edición (solo admin)
export function actualizarCategoria(id: number, datos: CategoriaInput): Promise<Categoria> {
  return pedir(api.put<Categoria>(`/categorias/${id}`, aCuerpo(datos)), "No se pudo actualizar la categoría");
}

// DELETE /categorias/{id} — baja lógica (solo admin)
export function eliminarCategoria(id: number): Promise<void> {
  return pedir(api.delete<void>(`/categorias/${id}`), "No se pudo eliminar la categoría");
}
