import { api, pedir } from "@/shared/api/api";
import type { Credenciales, Mensaje, RegistroInput, UsuarioPublico } from "../types/auth.types";

// POST /auth/token — formulario OAuth2. El backend responde con la cookie HttpOnly;
// el cuerpo es solo un mensaje, el token nunca llega a JavaScript.
export function iniciarSesion({ username, password }: Credenciales): Promise<Mensaje> {
  const formulario = new URLSearchParams({ username, password });
  return pedir(api.post<Mensaje>("/auth/token", formulario), "No se pudo iniciar sesión");
}

// GET /auth/me — el usuario dueño de la cookie
export function obtenerPerfil(): Promise<UsuarioPublico> {
  return pedir(api.get<UsuarioPublico>("/auth/me"), "No se pudo confirmar la sesión");
}

// POST /auth/logout — el backend borra la cookie
export function cerrarSesion(): Promise<Mensaje> {
  return pedir(api.post<Mensaje>("/auth/logout"), "No se pudo cerrar la sesión");
}

// POST /auth/register — público; crea el usuario con rol user
export function registrarse(datos: RegistroInput): Promise<UsuarioPublico> {
  return pedir(api.post<UsuarioPublico>("/auth/register", datos), "No se pudo completar el registro");
}
