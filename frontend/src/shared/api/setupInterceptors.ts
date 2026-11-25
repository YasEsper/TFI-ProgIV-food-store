import { isAxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { api } from "./api";

// Peticiones donde un 401 es parte del funcionamiento normal y no significa "la sesión venció":
// el login (credenciales incorrectas) y /auth/me (lo resuelve checkSession)
const RUTAS_DE_AUTH = ["/auth/token", "/auth/me"];
const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

// Se importa una sola vez, en main.tsx. Está aparte de api.ts para evitar una
// importación circular entre la instancia de Axios y los stores.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (isAxiosError(error)) {
      const url = error.config?.url ?? "";
      const status = error.response?.status;
      const detalle = error.response?.data?.detail;

      // 401 (sesión vencida) o cuenta desactivada: se limpia el store y ProtectedRoute lleva al login
      const sesionVencida = status === 401 && !RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));
      const desactivada = status === 400 && detalle === CUENTA_DESACTIVADA;
      if (sesionVencida || desactivada) {
        useAuthStore.getState().clearSession();
      }

      // 403: la sesión es válida pero el rol no alcanza. Se avisa sin cerrar la sesión.
      if (status === 403) {
        useNotificationStore
          .getState()
          .showNotification("Acceso denegado: no tenés permisos para esta acción", "error");
      }
    }
    return Promise.reject(error);
  },
);
