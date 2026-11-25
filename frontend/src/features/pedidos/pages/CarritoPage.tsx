import { Link, useNavigate } from "react-router-dom";
import Button from "@/shared/components/ui/Button";
import EstadoVacio from "@/shared/components/ui/EstadoVacio";
import { formatoPrecio } from "@/shared/formato";
import { useCartStore } from "@/store/cartStore";

// Pantalla pública: el carrito vive en el navegador (cartStore con persist).
// Al confirmar se pide sesión: /checkout está protegida y vuelve acá después del login.
function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);
  const vaciar = useCartStore((state) => state.vaciar);
  const total = useCartStore((state) => state.total());
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-semibold">Carrito</h2>
        <EstadoVacio mensaje="Tu carrito está vacío.">
          <Link to="/" className="btn bg-primary px-4 py-2 text-white hover:bg-primary-hover">
            Ver catálogo
          </Link>
        </EstadoVacio>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-semibold">Carrito</h2>

      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
        {items.map((item) => (
          <li key={item.producto_id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">{item.nombre}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formatoPrecio(item.precio_unitario)} c/u</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Bajar a 0 saca el producto: lo resuelve cambiarCantidad en el store */}
              <div className="flex items-center gap-1">
                <Button
                  variante="secondary"
                  tamano="sm"
                  aria-label={`Restar una unidad de ${item.nombre}`}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                >
                  −
                </Button>
                <span className="w-8 text-center">{item.cantidad}</span>
                <Button
                  variante="secondary"
                  tamano="sm"
                  aria-label={`Sumar una unidad de ${item.nombre}`}
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                >
                  +
                </Button>
              </div>
              <span className="w-28 text-right font-semibold">
                {formatoPrecio(item.precio_unitario * item.cantidad)}
              </span>
              <Button variante="danger" tamano="sm" onClick={() => quitar(item.producto_id)}>
                Quitar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        El stock se confirma al hacer el pedido: si alguna cantidad supera el disponible, se avisa en ese momento.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button variante="secondary" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold">Total: {formatoPrecio(total)}</span>
          <Button onClick={() => navigate("/checkout")}>Confirmar pedido</Button>
        </div>
      </div>
    </main>
  );
}

export default CarritoPage;
