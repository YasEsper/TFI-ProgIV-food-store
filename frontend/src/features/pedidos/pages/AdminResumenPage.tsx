import { Link } from "react-router-dom";
import EstadoError from "@/shared/components/ui/EstadoError";
import { formatoPrecio } from "@/shared/formato";
import { useResumenPedidos } from "../hooks/useResumenPedidos";
import type { ResumenPedidos } from "../types/pedido.types";

// Cada tarjeta: título y cómo mostrar su valor
const TARJETAS: { clave: keyof ResumenPedidos; titulo: string; formato?: (valor: number) => string }[] = [
  { clave: "pendientes", titulo: "Pendientes" },
  { clave: "en_preparacion", titulo: "En preparación" },
  { clave: "entregados", titulo: "Entregados" },
  { clave: "cancelados", titulo: "Cancelados" },
  { clave: "pedidos_hoy", titulo: "Pedidos de hoy" },
  { clave: "ingresos_entregados", titulo: "Ingresos (entregados)", formato: formatoPrecio },
];

const estiloTarjeta =
  "rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800";

// Solo admin: indicadores de GET /pedidos/resumen
function AdminResumenPage() {
  const { data: resumen, isLoading, isError, refetch } = useResumenPedidos();

  const renderTarjetas = () => {
    if (isError) return <EstadoError mensaje="No se pudo cargar el resumen." onReintentar={() => refetch()} />;
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TARJETAS.map(({ clave, titulo, formato }) => (
          <article key={clave} className={estiloTarjeta}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{titulo}</h3>
            {isLoading || !resumen ? (
              <div role="status" aria-label="Cargando" className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            ) : (
              <p className="mt-2 text-3xl font-bold">{formato ? formato(resumen[clave]) : resumen[clave]}</p>
            )}
          </article>
        ))}
      </div>
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Resumen del negocio</h2>
        <Link to="/admin/pedidos" className="font-medium text-primary hover:underline dark:text-indigo-300">
          Ir a pedidos
        </Link>
      </div>
      {renderTarjetas()}
    </main>
  );
}

export default AdminResumenPage;
