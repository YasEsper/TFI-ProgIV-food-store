import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError, useNotificationStore } from "@/store/notificationStore";
import { actualizarProducto, crearProducto, eliminarProducto, getProductos } from "../services/products.service";
import type { Producto, ProductoInput } from "../types/producto.types";

const CLAVE = ["productos"];
const SIN_DATOS: Producto[] = [];

// CRUD de productos: useQuery para el listado y useMutation para alta, edición y baja.
// Las páginas no llaman a Axios ni a TanStack Query: usan este hook.
export function useProducts() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const listado = useQuery({ queryKey: CLAVE, queryFn: getProductos });

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

  const eliminar = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: alTerminar("Producto eliminado correctamente"),
    onError: notificarError,
  });

  return {
    productos: listado.data ?? SIN_DATOS,
    isLoading: listado.isLoading,
    isError: listado.isError,
    refetch: listado.refetch,
    crear,
    actualizar,
    eliminar,
  };
}
