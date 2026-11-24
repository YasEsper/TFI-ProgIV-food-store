import Insignia, { type ColorInsignia } from "@/shared/components/ui/Insignia";
import type { EstadoPedido } from "../types/pedido.types";

// Texto y color de cada estado: el mismo en Mis pedidos y en el panel del admin
const ESTADOS: Record<EstadoPedido, { texto: string; color: ColorInsignia }> = {
  PENDIENTE: { texto: "Pendiente", color: "amarillo" },
  EN_PREPARACION: { texto: "En preparación", color: "azul" },
  ENTREGADO: { texto: "Entregado", color: "verde" },
  CANCELADO: { texto: "Cancelado", color: "rojo" },
};

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { texto, color } = ESTADOS[estado];
  return <Insignia color={color}>{texto}</Insignia>;
}

export default BadgeEstado;
