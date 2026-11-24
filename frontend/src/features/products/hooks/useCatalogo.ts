import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProductos } from "../services/products.service";
import type { FiltrosProductos, Producto } from "../types/producto.types";

const SIN_DATOS: Producto[] = [];

// Catálogo del cliente: cada combinación de filtros es una consulta distinta en la caché.
// keepPreviousData deja la página anterior a la vista mientras llega la nueva (sin parpadeo).
export function useCatalogo(filtros: FiltrosProductos) {
  const consulta = useQuery({
    queryKey: ["productos", "catalogo", filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData,
  });

  return {
    productos: consulta.data?.items ?? SIN_DATOS,
    total: consulta.data?.total ?? 0,
    isLoading: consulta.isLoading,
    isError: consulta.isError,
    refetch: consulta.refetch,
  };
}
