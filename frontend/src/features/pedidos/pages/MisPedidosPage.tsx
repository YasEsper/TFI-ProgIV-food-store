import { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmModal from "@/shared/components/ConfirmModal";
import EstadoCargando from "@/shared/components/ui/EstadoCargando";
import EstadoError from "@/shared/components/ui/EstadoError";
import EstadoVacio from "@/shared/components/ui/EstadoVacio";
import Paginador from "@/shared/components/ui/Paginador";
import TarjetaPedido from "../components/TarjetaPedido";
import { useMisPedidos } from "../hooks/useMisPedidos";
import type { Pedido } from "../types/pedido.types";

const POR_PAGINA = 5;

// Ruta protegida: el backend devuelve solo los pedidos del usuario de la cookie
function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [pedidoACancelar, setPedidoACancelar] = useState<Pedido | null>(null);
  const { pedidos, total, isLoading, isError, refetch, cancelar } = useMisPedidos(pagina, POR_PAGINA);

  const pedirCancelar = (pedido: Pedido) => {
    cancelar.reset();
    setPedidoACancelar(pedido);
  };

  const confirmarCancelar = () => {
    if (!pedidoACancelar) return;
    cancelar.mutate(pedidoACancelar.id, { onSuccess: () => setPedidoACancelar(null) });
  };

  const renderListado = () => {
    if (isLoading) return <EstadoCargando filas={POR_PAGINA} />;
    if (isError) {
      return <EstadoError mensaje="No se pudieron cargar tus pedidos." onReintentar={() => refetch()} />;
    }
    if (pedidos.length === 0) {
      return (
        <EstadoVacio mensaje="Todavía no hiciste ningún pedido.">
          <Link to="/" className="btn bg-primary px-4 py-2 text-white hover:bg-primary-hover">
            Ver catálogo
          </Link>
        </EstadoVacio>
      );
    }
    return (
      <>
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <TarjetaPedido key={pedido.id} pedido={pedido} onCancelar={pedirCancelar} />
          ))}
        </div>
        <Paginador pagina={pagina} total={total} porPagina={POR_PAGINA} onCambiar={setPagina} />
      </>
    );
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-semibold">Mis pedidos</h2>

      {renderListado()}

      <ConfirmModal
        abierto={pedidoACancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Seguro que querés cancelar el pedido #${pedidoACancelar?.id}? El stock vuelve a quedar disponible.`}
        error={cancelar.error?.message ?? null}
        procesando={cancelar.isPending}
        textoConfirmar="Cancelar pedido"
        onConfirmar={confirmarCancelar}
        onCancelar={() => setPedidoACancelar(null)}
      />
    </main>
  );
}

export default MisPedidosPage;
