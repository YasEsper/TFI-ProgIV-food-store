// Categoría tal como viene dentro de un producto
export interface CategoriaDeProducto {
  id: number;
  nombre: string;
  es_principal: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagenes_url: string[];
  disponible: boolean;
  categorias: CategoriaDeProducto[]; // la principal primero
}

// Campos que se cargan en el formulario (las imágenes y las categorías no se editan desde el front)
export type ProductoInput = Pick<Producto, "nombre" | "descripcion" | "precio_base" | "disponible">;
