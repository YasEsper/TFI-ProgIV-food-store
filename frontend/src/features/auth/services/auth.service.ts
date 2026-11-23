import { api, pedir } from "@/shared/api/api";
import type { Credenciales, Mensaje, RegistroInput, UsuarioPublico } from "../types/auth.types";

// POST /auth/token — el backend responde con la cookie HttpOnly; el cuerpo es solo un mensaje.
// Va como formulario OAuth2: el campo username lleva el email.
export function iniciarSesion({ email, password }: Credenciales): Promise<Mensaje> {
  const formulario = new URLSearchParams({ username: email, password });
  return pedir(api.post<Mensaje>("/auth/token", formulario), "No se pudo iniciar sesión");
}

// GET /auth/me — datos y roles vigentes del usuario de la cookie
export function obtenerPerfil(): Promise<UsuarioPublico> {
  return pedir(api.get<UsuarioPublico>("/auth/me"), "No se pudo confirmar la sesión");
}

// POST /auth/logout — el backend borra la cookie
export function cerrarSesion(): Promise<Mensaje> {
  return pedir(api.post<Mensaje>("/auth/logout"), "No se pudo cerrar la sesión");
}

// POST /auth/register — público; asigna el rol user
export function registrarse(datos: RegistroInput): Promise<UsuarioPublico> {
  const cuerpo = { ...datos, celular: datos.celular.trim() || null };
  return pedir(api.post<UsuarioPublico>("/auth/register", cuerpo), "No se pudo completar el registro");
}
