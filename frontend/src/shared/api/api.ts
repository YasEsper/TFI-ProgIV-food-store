import axios, { isAxiosError } from "axios";

// URL del backend. Se puede cambiar con VITE_API_URL en un archivo .env.local
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Instancia única de Axios: todas las peticiones del frontend pasan por acá.
// Los interceptores están en setupInterceptors.ts, para que este archivo no importe stores.
export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  // El navegador adjunta la cookie HttpOnly access_token en cada petición.
  // El token no se lee ni se guarda en JavaScript.
  withCredentials: true,
});

// Código HTTP de un error de Axios, o del error que envuelve pedir() (en su cause)
export function estadoHttp(error: unknown): number | undefined {
  if (isAxiosError(error)) return error.response?.status;
  return error instanceof Error ? estadoHttp(error.cause) : undefined;
}

// Mensaje para mostrar en pantalla: el texto propio más el "detail" que manda FastAPI, si es texto
export function mensajeDeError(error: unknown, mensajeBase: string): string {
  const detalle = isAxiosError(error) ? error.response?.data?.detail : undefined;
  return typeof detalle === "string" ? `${mensajeBase}: ${detalle}` : mensajeBase;
}

// Hace la petición y devuelve solo los datos; si falla, lanza un Error con el mensaje para el usuario
export async function pedir<T>(peticion: Promise<{ data: T }>, mensajeError: string): Promise<T> {
  try {
    const { data } = await peticion;
    return data;
  } catch (error) {
    throw new Error(mensajeDeError(error, mensajeError), { cause: error });
  }
}
