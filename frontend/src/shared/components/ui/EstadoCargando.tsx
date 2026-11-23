type EstadoCargandoProps = {
  filas?: number;
};

// Skeleton: anticipa la forma de la tabla mientras llegan los datos
function EstadoCargando({ filas = 5 }: EstadoCargandoProps) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="h-6 w-1/3 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      ))}
    </div>
  );
}

export default EstadoCargando;