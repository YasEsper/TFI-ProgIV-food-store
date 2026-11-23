import { api, pedir } from "@/shared/api/api";
import type { Ingrediente, IngredienteInput } from "../types/ingrediente.types";

// GET /ingredientes/ — listado (cualquier usuario autenticado)
export function getIngredientes(): Promise<Ingrediente[]> {
  return pedir(api.get<Ingrediente[]>("/ingredientes/"), "No se pudieron cargar los ingredientes");
}

// POST /ingredientes/ — alta (solo admin)
export function crearIngrediente(datos: IngredienteInput): Promise<Ingrediente> {
  return pedir(api.post<Ingrediente>("/ingredientes/", datos), "No se pudo crear el ingrediente");
}

// PUT /ingredientes/{id} — edición (solo admin)
export function actualizarIngrediente(id: number, datos: IngredienteInput): Promise<Ingrediente> {
  return pedir(api.put<Ingrediente>(`/ingredientes/${id}`, datos), "No se pudo actualizar el ingrediente");
}

// DELETE /ingredientes/{id} — borrado lógico (solo admin)
export function eliminarIngrediente(id: number): Promise<void> {
  return pedir(api.delete<void>(`/ingredientes/${id}`), "No se pudo eliminar el ingrediente");
}
