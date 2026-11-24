import type { Categoria } from "@/features/categories";

// Mismos nombres de campo que ProductoRead del backend
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: Categoria;
}

// Respuesta de GET /productos (ProductosPaginados)
export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

// Parámetros del listado: paginación, búsqueda y filtros
export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

// Lo que se carga en el formulario del panel (ProductoCreate / ProductoUpdate)
export interface ProductoInput {
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
}
