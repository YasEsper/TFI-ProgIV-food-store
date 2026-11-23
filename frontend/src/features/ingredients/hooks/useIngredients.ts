import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificarError, useNotificationStore } from "@/store/notificationStore";
import { actualizarIngrediente, crearIngrediente, eliminarIngrediente, getIngredientes } from "../services/ingredients.service";
import type { Ingrediente, IngredienteInput } from "../types/ingrediente.types";

const CLAVE = ["ingredientes"];
const SIN_DATOS: Ingrediente[] = [];

// CRUD de ingredientes: useQuery para el listado y useMutation para alta, edición y baja.
// Las páginas no llaman a Axios ni a TanStack Query: usan este hook.
export function useIngredients() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const listado = useQuery({ queryKey: CLAVE, queryFn: getIngredientes });

  // Después de cada operación se vuelve a pedir el listado y se avisa con el Toast
  const alTerminar = (mensaje: string) => () => {
    queryClient.invalidateQueries({ queryKey: CLAVE });
    showNotification(mensaje);
  };

  const crear = useMutation({
    mutationFn: crearIngrediente,
    onSuccess: alTerminar("Ingrediente creado correctamente"),
    onError: notificarError,
  });

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: IngredienteInput }) => actualizarIngrediente(id, datos),
    onSuccess: alTerminar("Ingrediente actualizado correctamente"),
    onError: notificarError,
  });

  const eliminar = useMutation({
    mutationFn: eliminarIngrediente,
    onSuccess: alTerminar("Ingrediente eliminado correctamente"),
    onError: notificarError,
  });

  return {
    ingredientes: listado.data ?? SIN_DATOS,
    isLoading: listado.isLoading,
    isError: listado.isError,
    refetch: listado.refetch,
    crear,
    actualizar,
    eliminar,
  };
}
