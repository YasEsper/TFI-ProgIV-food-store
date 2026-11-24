import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { crearPedido } from "../services/pedidos.service";
import type { DatosEntrega } from "../types/pedido.types";

// Arma el pedido con el carrito y los datos de entrega. Si sale bien, vacía el carrito
// y refresca pedidos y productos (el stock bajó). Si falla, el carrito queda como estaba.
export function useCrearPedido() {
  const queryClient = useQueryClient();
  const items = useCartStore((state) => state.items);
  const vaciar = useCartStore((state) => state.vaciar);
  const showNotification = useNotificationStore((state) => state.showNotification);

  return useMutation({
    mutationFn: (datos: DatosEntrega) =>
      crearPedido({
        items: items.map(({ producto_id, cantidad }) => ({ producto_id, cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega.trim(),
        notas: datos.notas.trim() || null,
      }),
    onSuccess: (pedido) => {
      vaciar();
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification(`Pedido #${pedido.id} creado correctamente`);
    },
    // El error no va al Toast: se muestra dentro del checkout, junto al botón
  });
}
