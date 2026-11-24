import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { cancelarPedido, getPedidos } from "../services/pedidos.service";
import type { Pedido } from "../types/pedido.types";

const SIN_DATOS: Pedido[] = [];

// Pedidos del usuario con sesión, paginados en el servidor, y la cancelación
export function useMisPedidos(pagina: number, porPagina: number) {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const filtros = { skip: pagina * porPagina, limit: porPagina };

  const listado = useQuery({
    queryKey: ["pedidos", "mios", filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  });

  // Al cancelar, el backend devuelve el stock: se refrescan pedidos y productos
  const cancelar = useMutation({
    mutationFn: cancelarPedido,
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification(`Pedido #${pedido.id} cancelado`);
    },
  });

  return {
    pedidos: listado.data?.items ?? SIN_DATOS,
    total: listado.data?.total ?? 0,
    isLoading: listado.isLoading,
    isError: listado.isError,
    refetch: listado.refetch,
    cancelar,
  };
}
