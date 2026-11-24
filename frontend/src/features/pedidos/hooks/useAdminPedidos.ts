import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError, useNotificationStore } from "@/store/notificationStore";
import { cambiarEstadoPedido, getPedidos } from "../services/pedidos.service";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

const SIN_DATOS: Pedido[] = [];
// Como en el resto del panel: se piden hasta 100 y TanStack Table pagina del lado del cliente
const LIMITE_PANEL = 100;

// Todos los pedidos para el admin (el filtro por estado lo aplica el backend) y el cambio de estado
export function useAdminPedidos(estado: EstadoPedido | undefined) {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const filtros = { skip: 0, limit: LIMITE_PANEL, estado };

  const listado = useQuery({
    queryKey: ["pedidos", "admin", filtros],
    queryFn: () => getPedidos(filtros),
  });

  // Un cambio de estado afecta los listados, el resumen y, si cancela, el stock de los productos
  const cambiarEstado = useMutation({
    mutationFn: ({ id, nuevo }: { id: number; nuevo: EstadoPedido }) => cambiarEstadoPedido(id, nuevo),
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification(`Pedido #${pedido.id} actualizado`);
    },
    onError: notificarError,
  });

  return {
    pedidos: listado.data?.items ?? SIN_DATOS,
    isLoading: listado.isLoading,
    isError: listado.isError,
    refetch: listado.refetch,
    cambiarEstado,
  };
}
