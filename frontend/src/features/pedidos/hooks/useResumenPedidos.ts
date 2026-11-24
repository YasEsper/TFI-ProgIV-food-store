import { useQuery } from "@tanstack/react-query";
import { getResumen } from "../services/pedidos.service";

// Indicadores del panel. La clave empieza con "pedidos": al cambiar un pedido, el resumen se refresca solo.
export function useResumenPedidos() {
  return useQuery({ queryKey: ["pedidos", "resumen"], queryFn: getResumen });
}
