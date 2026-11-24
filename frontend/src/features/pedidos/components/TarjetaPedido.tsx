import { useState } from "react";
import Button from "@/shared/components/ui/Button";
import { formatoFecha, formatoPrecio } from "@/shared/formato";
import type { Pedido } from "../types/pedido.types";
import BadgeEstado from "./BadgeEstado";

type TarjetaPedidoProps = {
  pedido: Pedido;
  onCancelar: (pedido: Pedido) => void;
};

const FORMAS_PAGO = { EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia" } as const;

// Un pedido de Mis pedidos: datos principales y, al desplegarlo, el detalle de productos
function TarjetaPedido({ pedido, onCancelar }: TarjetaPedidoProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold">Pedido #{pedido.id}</h3>
          <BadgeEstado estado={pedido.estado} />
        </div>
        <span className="text-lg font-bold">{formatoPrecio(pedido.total)}</span>
      </div>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {formatoFecha(pedido.created_at)} · {FORMAS_PAGO[pedido.forma_pago]} · {pedido.direccion_entrega}
      </p>

      {abierto && (
        <div className="mt-3 border-t border-gray-100 pt-3 text-sm dark:border-gray-700">
          <ul className="space-y-1">
            {pedido.items.map((item) => (
              <li key={item.producto_id} className="flex justify-between">
                <span>
                  {item.cantidad} × {item.nombre_producto} ({formatoPrecio(item.precio_unitario)})
                </span>
                <span>{formatoPrecio(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          {pedido.notas && <p className="mt-2 text-gray-500 dark:text-gray-400">Notas: {pedido.notas}</p>}
        </div>
      )}

      <div className="mt-3 flex justify-end gap-2">
        <Button variante="secondary" tamano="sm" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
          {abierto ? "Ocultar detalle" : "Ver detalle"}
        </Button>
        {/* Solo mientras está PENDIENTE: después lo puede cancelar únicamente el admin */}
        {pedido.estado === "PENDIENTE" && (
          <Button variante="danger" tamano="sm" onClick={() => onCancelar(pedido)}>
            Cancelar
          </Button>
        )}
      </div>
    </article>
  );
}

export default TarjetaPedido;
