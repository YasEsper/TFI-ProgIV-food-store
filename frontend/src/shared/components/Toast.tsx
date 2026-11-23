import { useEffect } from "react";
import { useNotificationStore, type TipoNotificacion } from "@/store/notificationStore";

const DURACION_MS = 3000;

const COLORES: Record<TipoNotificacion, string> = {
  success: "bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900",
  error: "bg-danger text-white",
};

// Se monta una sola vez, en App.tsx. Muestra el aviso del notificationStore y se oculta solo.
function Toast() {
  const message = useNotificationStore((state) => state.message);
  const tipo = useNotificationStore((state) => state.tipo);
  const show = useNotificationStore((state) => state.show);
  const id = useNotificationStore((state) => state.id);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(hideNotification, DURACION_MS);
    return () => clearTimeout(timer);
  }, [show, id, hideNotification]); // cada aviso nuevo (id distinto) reinicia el tiempo

  if (!show) return null;

  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`fixed bottom-4 right-4 z-50 max-w-sm rounded px-4 py-2 shadow-lg ${COLORES[tipo]}`}
    >
      {message}
    </div>
  );
}

export default Toast;
