import Button from "@/shared/components/ui/Button";
import Insignia from "@/shared/components/ui/Insignia";
import { formatoPrecio } from "@/shared/formato";
import type { Producto } from "../types/producto.types";

type TarjetaProductoProps = {
  producto: Producto;
  cantidadEnCarrito: number;
  onAgregar: (producto: Producto) => void;
};

// Un producto del catálogo. Sin stock, o con todo el stock ya en el carrito, no se puede agregar.
function TarjetaProducto({ producto, cantidadEnCarrito, onAgregar }: TarjetaProductoProps) {
  const sinStock = producto.stock === 0;
  const alTope = !sinStock && cantidadEnCarrito >= producto.stock;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {producto.imagen_url ? (
        <img src={producto.imagen_url} alt={producto.nombre} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-700">
          Sin imagen
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{producto.nombre}</h3>
          <Insignia>{producto.categoria.nombre}</Insignia>
        </div>
        {producto.descripcion && <p className="text-sm text-gray-600 dark:text-gray-300">{producto.descripcion}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold">{formatoPrecio(producto.precio_base)}</span>
          {sinStock ? (
            <Insignia color="rojo">Sin stock</Insignia>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">Stock: {producto.stock}</span>
          )}
        </div>

        <Button onClick={() => onAgregar(producto)} disabled={sinStock || alTope}>
          {alTope ? "Máximo en el carrito" : "Agregar al carrito"}
        </Button>
        {cantidadEnCarrito > 0 && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">En el carrito: {cantidadEnCarrito}</p>
        )}
      </div>
    </article>
  );
}

export default TarjetaProducto;
