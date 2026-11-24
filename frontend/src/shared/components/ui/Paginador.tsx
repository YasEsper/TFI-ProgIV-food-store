import Button from "./Button";

type PaginadorProps = {
  pagina: number; // empieza en 0
  total: number; // cantidad total de registros que informa la API
  porPagina: number;
  onCambiar: (pagina: number) => void;
};

// Paginación del lado del servidor: la API devuelve el total y la página pedida con skip y limit
function Paginador({ pagina, total, porPagina, onCambiar }: PaginadorProps) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));

  return (
    <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
      <span>
        Página {pagina + 1} de {paginas} · {total} en total
      </span>
      <div className="flex gap-2">
        <Button variante="secondary" tamano="sm" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 0}>
          Anterior
        </Button>
        <Button
          variante="secondary"
          tamano="sm"
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina + 1 >= paginas}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

export default Paginador;
