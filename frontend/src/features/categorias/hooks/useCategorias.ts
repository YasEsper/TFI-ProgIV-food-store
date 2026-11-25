import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError, useNotificationStore } from "@/store/notificationStore";
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from "../services/categorias.service";
import type { Categoria, CategoriaInput } from "../types/categoria.types";

const CLAVE = ["categorias"];
const SIN_DATOS: Categoria[] = [];

// CRUD de categorías: useQuery para el listado y useMutation para alta, edición y baja.
// Las páginas no llaman a Axios ni a TanStack Query: usan este hook.
export function useCategorias() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const listado = useQuery({ queryKey: CLAVE, queryFn: getCategorias });

  // Después de cada operación se vuelve a pedir el listado y se avisa con el Toast
  const alTerminar = (mensaje: string) => () => {
    queryClient.invalidateQueries({ queryKey: CLAVE });
    showNotification(mensaje);
  };

  const crear = useMutation({
    mutationFn: crearCategoria,
    onSuccess: alTerminar("Categoría creada correctamente"),
    onError: notificarError,
  });

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaInput }) => actualizarCategoria(id, datos),
    onSuccess: alTerminar("Categoría actualizada correctamente"),
    onError: notificarError,
  });

  const eliminar = useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: alTerminar("Categoría eliminada correctamente"),
    onError: notificarError,
  });

  return {
    categorias: listado.data ?? SIN_DATOS,
    isLoading: listado.isLoading,
    isError: listado.isError,
    refetch: listado.refetch,
    crear,
    actualizar,
    eliminar,
  };
}
