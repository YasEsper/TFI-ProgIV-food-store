import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError, useNotificationStore } from "@/store/notificationStore";
import { cambiarEstadoUsuario, getUsuarios } from "../services/usuarios.service";
import type { UsuarioPublico } from "../types/auth.types";

const CLAVE = ["usuarios"];
const SIN_USUARIOS: UsuarioPublico[] = [];

// Listado de usuarios y activar / desactivar (solo admin)
export function useAdminUsers() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const listado = useQuery({ queryKey: CLAVE, queryFn: getUsuarios });

  const cambiarEstado = useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) => cambiarEstadoUsuario(id, activar),
    onSuccess: (usuario) => {
      queryClient.invalidateQueries({ queryKey: CLAVE });
      showNotification(`Usuario ${usuario.username} ${usuario.disabled ? "desactivado" : "activado"}`);
    },
    onError: notificarError,
  });

  return {
    usuarios: listado.data ?? SIN_USUARIOS,
    isLoading: listado.isLoading,
    isError: listado.isError,
    refetch: listado.refetch,
    cambiarEstado,
  };
}
