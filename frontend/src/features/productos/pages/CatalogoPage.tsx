import { useEffect, useState } from "react";
import { useCategorias } from "@/features/categorias";
import EstadoCargando from "@/shared/components/ui/EstadoCargando";
import EstadoError from "@/shared/components/ui/EstadoError";
import EstadoVacio from "@/shared/components/ui/EstadoVacio";
import Paginador from "@/shared/components/ui/Paginador";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import TarjetaProducto from "../components/TarjetaProducto";
import { useCatalogo } from "../hooks/useCatalogo";
import type { Producto } from "../types/producto.types";

const POR_PAGINA = 6;
const ESPERA_BUSQUEDA_MS = 400;

const estiloControl =
  "rounded border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-900";

// Pantalla pública: cualquiera ve el catálogo; para confirmar la compra hace falta sesión
function CatalogoPage() {
  const [texto, setTexto] = useState(""); // lo que se escribe en el buscador
  const [busqueda, setBusqueda] = useState(""); // lo que se manda a la API
  const [categoriaId, setCategoriaId] = useState(0); // 0 = todas
  const [pagina, setPagina] = useState(0);

  const { categorias } = useCategorias();
  const items = useCartStore((state) => state.items);
  const agregar = useCartStore((state) => state.agregar);
  const showNotification = useNotificationStore((state) => state.showNotification);

  // Debounce: espera a que se deje de escribir para no pedirle a la API en cada tecla
  useEffect(() => {
    const espera = setTimeout(() => {
      setBusqueda(texto.trim());
      setPagina(0);
    }, ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(espera);
  }, [texto]);

  // Solo productos disponibles; la búsqueda, la categoría y la página las resuelve el backend
  const { productos, total, isLoading, isError, refetch } = useCatalogo({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    disponible: true,
    search: busqueda || undefined,
    categoria_id: categoriaId || undefined,
  });

  const cantidadEnCarrito = (id: number) => items.find((i) => i.producto_id === id)?.cantidad ?? 0;

  const agregarAlCarrito = (producto: Producto) => {
    agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base });
    showNotification(`${producto.nombre} agregado al carrito`);
  };

  const cambiarCategoria = (id: number) => {
    setCategoriaId(id);
    setPagina(0);
  };

  // Un solo estado visible a la vez: cargando, error, vacío o las tarjetas
  const renderListado = () => {
    if (isLoading) return <EstadoCargando filas={POR_PAGINA} />;
    if (isError) {
      return (
        <EstadoError
          mensaje="No se pudo cargar el catálogo. Revisá que el backend esté levantado."
          onReintentar={() => refetch()}
        />
      );
    }
    if (productos.length === 0) {
      return <EstadoVacio mensaje="No hay productos que coincidan con la búsqueda." />;
    }
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              cantidadEnCarrito={cantidadEnCarrito(producto.id)}
              onAgregar={agregarAlCarrito}
            />
          ))}
        </div>
        <Paginador pagina={pagina} total={total} porPagina={POR_PAGINA} onCambiar={setPagina} />
      </>
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-semibold">Catálogo</h2>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          aria-label="Buscar producto"
          placeholder="Buscar por nombre..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className={`flex-1 ${estiloControl}`}
        />
        <select
          aria-label="Filtrar por categoría"
          value={categoriaId}
          onChange={(e) => cambiarCategoria(Number(e.target.value))}
          className={estiloControl}
        >
          <option value={0}>Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {renderListado()}
    </main>
  );
}

export default CatalogoPage;
