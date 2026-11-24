// Mismos nombres de campo que CategoriaRead del backend
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

// Lo que se carga en el formulario (CategoriaCreate / CategoriaUpdate)
export interface CategoriaInput {
  nombre: string;
  descripcion: string;
}
