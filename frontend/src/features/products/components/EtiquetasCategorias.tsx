import type { CategoriaDeProducto } from "../types/producto.types";

type EtiquetasCategoriasProps = {
  categorias: CategoriaDeProducto[];
};

// Categorías de un producto como etiquetas; la principal, resaltada
function EtiquetasCategorias({ categorias }: EtiquetasCategoriasProps) {
  if (categorias.length === 0) return <span className="text-gray-400">Sin categoría</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {categorias.map((categoria) => (
        <span
          key={categoria.id}
          title={categoria.es_principal ? "Categoría principal" : undefined}
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            categoria.es_principal ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {categoria.es_principal ? "★ " : ""}
          {categoria.nombre}
        </span>
      ))}
    </div>
  );
}

export default EtiquetasCategorias;
