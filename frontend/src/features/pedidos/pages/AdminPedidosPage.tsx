import { useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import ConfirmModal from "@/shared/components/ConfirmModal";
import Button from "@/shared/components/ui/Button";
import EstadoCargando from "@/shared/components/ui/EstadoCargando";
import EstadoError from "@/shared/components/ui/EstadoError";
import EstadoVacio from "@/shared/components/ui/EstadoVacio";
import Tabla from "@/shared/components/ui/Tabla";
import { formatoFecha, formatoPrecio } from "@/shared/formato";
import BadgeEstado from "../components/BadgeEstado";
import DetallePedidoModal from "../components/DetallePedidoModal";
import { useAdminPedidos } from "../hooks/useAdminPedidos";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

const FILAS_POR_PAGINA = 10;

const COLUMNAS: ColumnDef<Pedido>[] = [
  { accessorKey: "id", header: "Pedido", cell: ({ getValue }) => `#${getValue<number>()}` },
  { accessorKey: "usuario_id", header: "Cliente", cell: ({ getValue }) => `usuario #${getValue<number>()}` },
  { accessorKey: "created_at", header: "Fecha", cell: ({ getValue }) => formatoFecha(getValue<string>()) },
  { accessorKey: "forma_pago", header: "Pago" },
  { accessorKey: "total", header: "Total", cell: ({ getValue }) => formatoPrecio(getValue<number>()) },
  { accessorKey: "estado", header: "Estado", cell: ({ getValue }) => <BadgeEstado estado={getValue<EstadoPedido>()} /> },
];

const FILTROS: { valor: EstadoPedido | ""; texto: string }[] = [
  { valor: "", texto: "Todos los estados" },
  { valor: "PENDIENTE", texto: "Pendientes" },
  { valor: "EN_PREPARACION", texto: "En preparación" },
  { valor: "ENTREGADO", texto: "Entregados" },
  { valor: "CANCELADO", texto: "Cancelados" },
];

// El paso siguiente de cada estado no terminal (la misma máquina de estados que valida el backend).
// Los terminales, ENTREGADO y CANCELADO, no tienen botones.
const SIGUIENTE: Partial<Record<EstadoPedido, { estado: EstadoPedido; texto: string }>> = {
  PENDIENTE: { estado: "EN_PREPARACION", texto: "Preparar" },
  EN_PREPARACION: { estado: "ENTREGADO", texto: "Entregar" },
};

// Solo admin: la ruta la protege ProtectedRoute y el backend responde 403 a un user
function AdminPedidosPage() {
  const [filtro, setFiltro] = useState<EstadoPedido | "">("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [pedidoACancelar, setPedidoACancelar] = useState<Pedido | null>(null);
  const { pedidos, isLoading, isError, refetch, cambiarEstado } = useAdminPedidos(filtro || undefined);

  const table = useReactTable({
    data: pedidos,
    columns: COLUMNAS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: FILAS_POR_PAGINA } },
  });

  const avanzar = (pedido: Pedido, nuevo: EstadoPedido) => cambiarEstado.mutate({ id: pedido.id, nuevo });

  const pedirCancelar = (pedido: Pedido) => {
    cambiarEstado.reset();
    setPedidoACancelar(pedido);
  };

  const confirmarCancelar = () => {
    if (!pedidoACancelar) return;
    cambiarEstado.mutate(
      { id: pedidoACancelar.id, nuevo: "CANCELADO" },
      { onSuccess: () => setPedidoACancelar(null) },
    );
  };

  const acciones = (pedido: Pedido) => {
    const siguiente = SIGUIENTE[pedido.estado];
    return (
      <>
        <Button variante="secondary" tamano="sm" onClick={() => setPedidoDetalle(pedido)}>
          Ver
        </Button>
        {siguiente && (
          <>
            <Button tamano="sm" onClick={() => avanzar(pedido, siguiente.estado)} disabled={cambiarEstado.isPending}>
              {siguiente.texto}
            </Button>
            <Button variante="danger" tamano="sm" onClick={() => pedirCancelar(pedido)} disabled={cambiarEstado.isPending}>
              Cancelar
            </Button>
          </>
        )}
      </>
    );
  };

  const renderListado = () => {
    if (isLoading) return <EstadoCargando filas={FILAS_POR_PAGINA} />;
    if (isError) return <EstadoError mensaje="No se pudieron cargar los pedidos." onReintentar={() => refetch()} />;
    if (pedidos.length === 0) return <EstadoVacio mensaje="No hay pedidos con ese estado." />;
    return <Tabla table={table} acciones={acciones} />;
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Administrar pedidos</h2>
        <select
          aria-label="Filtrar por estado"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as EstadoPedido | "")}
          className="rounded border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900"
        >
          {FILTROS.map((f) => (
            <option key={f.valor} value={f.valor}>
              {f.texto}
            </option>
          ))}
        </select>
      </div>

      {renderListado()}

      <DetallePedidoModal pedido={pedidoDetalle} onClose={() => setPedidoDetalle(null)} />

      <ConfirmModal
        abierto={pedidoACancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Seguro que querés cancelar el pedido #${pedidoACancelar?.id}? El stock vuelve a quedar disponible.`}
        error={cambiarEstado.error?.message ?? null}
        procesando={cambiarEstado.isPending}
        textoConfirmar="Cancelar pedido"
        onConfirmar={confirmarCancelar}
        onCancelar={() => setPedidoACancelar(null)}
      />
    </main>
  );
}

export default AdminPedidosPage;
