import { api, pedir } from "@/shared/api/api";
import type { UsuarioPublico } from "@/features/auth";

// GET /admin/usuarios — todos los usuarios, también los desactivados (solo admin)
export function getUsuarios(): Promise<UsuarioPublico[]> {
  return pedir(api.get<UsuarioPublico[]>("/admin/usuarios"), "No se pudieron cargar los usuarios");
}

// POST /admin/usuarios/{id}/activar | desactivar (solo admin)
export function cambiarEstadoUsuario(id: number, activar: boolean): Promise<UsuarioPublico> {
  const accion = activar ? "activar" : "desactivar";
  return pedir(api.post<UsuarioPublico>(`/admin/usuarios/${id}/${accion}`), `No se pudo ${accion} el usuario`);
}
