import { create } from "zustand";
import { estadoHttp } from "@/shared/api/api";

export type TipoNotificacion = "success" | "error";

interface NotificationStore {
  message: string;
  tipo: TipoNotificacion;
  show: boolean;
  id: number; // cambia en cada aviso: así un mensaje repetido también reinicia el tiempo del Toast
  showNotification: (message: string, tipo?: TipoNotificacion) => void;
  hideNotification: () => void;
}

// Una notificación a la vez: un aviso nuevo reemplaza al anterior
export const useNotificationStore = create<NotificationStore>()((set) => ({
  message: "",
  tipo: "success",
  show: false,
  id: 0,
  showNotification: (message, tipo = "success") =>
    set((state) => ({ message, tipo, show: true, id: state.id + 1 })),
  hideNotification: () => set({ message: "", show: false }),
}));

// Avisa el error de una operación. El 403 no se repite: ya lo avisa el interceptor.
export function notificarError(error: Error) {
  if (estadoHttp(error) === 403) return;
  useNotificationStore.getState().showNotification(error.message, "error");
}
