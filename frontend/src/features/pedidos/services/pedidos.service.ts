import { api, pedir } from "@/shared/api/api";
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoInput,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido.types";

// POST /pedidos — crea el pedido con lo que hay en el carrito (requiere sesión)
export function crearPedido(datos: PedidoInput): Promise<Pedido> {
  return pedir(api.post<Pedido>("/pedidos", datos), "No se pudo crear el pedido");
}

// GET /pedidos — un user recibe solo los suyos; el admin, todos
export function getPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  return pedir(api.get<PedidosPaginados>("/pedidos", { params: filtros }), "No se pudieron cargar los pedidos");
}

// PATCH /pedidos/{id}/cancelar — el dueño cancela su pedido mientras está PENDIENTE
export function cancelarPedido(id: number): Promise<Pedido> {
  return pedir(api.patch<Pedido>(`/pedidos/${id}/cancelar`), "No se pudo cancelar el pedido");
}

// PATCH /pedidos/{id}/estado — el admin avanza o cancela según la máquina de estados
export function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  return pedir(api.patch<Pedido>(`/pedidos/${id}/estado`, { estado }), "No se pudo cambiar el estado del pedido");
}

// GET /pedidos/resumen — indicadores del panel (solo admin)
export function getResumen(): Promise<ResumenPedidos> {
  return pedir(api.get<ResumenPedidos>("/pedidos/resumen"), "No se pudo cargar el resumen");
}
