import Button from "@/shared/components/ui/Button";
import { formatoFecha, formatoPrecio } from "@/shared/formato";
import type { Pedido } from "../types/pedido.types";
import BadgeEstado from "./BadgeEstado";

type DetallePedidoModalProps = {
  pedido: Pedido | null; // null = cerrado
  onClose: () => void;
};

// Detalle de un pedido para el admin: datos de entrega y líneas con el precio copiado al comprar
function DetallePedidoModal({ pedido, onClose }: DetallePedidoModalProps) {
  if (!pedido) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-labelledby="titulo-detalle"
        className="w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <div className="flex items-center gap-3">
          <h2 id="titulo-detalle" className="text-xl font-semibold">
            Pedido #{pedido.id}
          </h2>
          <BadgeEstado estado={pedido.estado} />
        </div>

        <dl className="space-y-1 text-sm">
          <div>
            <dt className="inline font-medium">Cliente: </dt>
            <dd className="inline">usuario #{pedido.usuario_id}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Fecha: </dt>
            <dd className="inline">{formatoFecha(pedido.created_at)}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Entrega: </dt>
            <dd className="inline">{pedido.direccion_entrega}</dd>
          </div>
          {pedido.notas && (
            <div>
              <dt className="inline font-medium">Notas: </dt>
              <dd className="inline">{pedido.notas}</dd>
            </div>
          )}
        </dl>

        <ul className="space-y-1 border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
          {pedido.items.map((item) => (
            <li key={item.producto_id} className="flex justify-between">
              <span>
                {item.cantidad} × {item.nombre_producto} ({formatoPrecio(item.precio_unitario)})
              </span>
              <span>{formatoPrecio(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between border-t border-gray-100 pt-3 font-bold dark:border-gray-700">
          <span>Total</span>
          <span>{formatoPrecio(pedido.total)}</span>
        </p>

        <div className="flex justify-end">
          <Button variante="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DetallePedidoModal;
