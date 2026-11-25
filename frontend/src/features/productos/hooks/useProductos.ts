import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError, useNotificationStore } from "@/store/notificationStore";
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  getProductos,
} from "../services/productos.service";
import type { Producto, ProductoInput, StockInput } from "../types/producto.types";

// ["productos"] agrupa todas las consultas de productos: invalidarla refresca también el catálogo
const CLAVE = ["productos"];
const SIN_DATOS: Producto[] = [];
// El panel pide hasta 100 productos y los pagina TanStack Table del lado del cliente
const FILTROS_PANEL = { skip: 0, limit: 100 };

// CRUD de productos del panel: useQuery para el listado y useMutation para alta, edición y baja.
// Las páginas no llaman a Axios ni a TanStack Query: usan este hook.
export function useProductos() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const listado = useQuery({
    queryKey: [...CLAVE, FILTROS_PANEL],
    queryFn: () => getProductos(FILTROS_PANEL),
  });

  // Después de cada operación se vuelve a pedir el listado y se avisa con el Toast
  const alTerminar = (mensaje: string) => () => {
    queryClient.invalidateQueries({ queryKey: CLAVE });
    showNotification(mensaje);
  };

  const crear = useMutation({
    mutationFn: crearProducto,
    onSuccess: alTerminar("Producto creado correctamente"),
    onError: notificarError,
  });

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoInput }) => actualizarProducto(id, datos),
    onSuccess: alTerminar("Producto actualizado correctamente"),
    onError: notificarError,
  });

  const cambiarStock = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: StockInput }) => actualizarStock(id, datos),
    onSuccess: alTerminar("Stock actualizado correctamente"),
    onError: notificarError,
  });

  const eliminar = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: alTerminar("Producto eliminado correctamente"),
    onError: notificarError,
  });

  return {
    productos: listado.data?.items ?? SIN_DATOS,
    isLoading: listado.isLoading,
    isError: listado.isError,
    refetch: listado.refetch,
    crear,
    actualizar,
    cambiarStock,
    eliminar,
  };
}
