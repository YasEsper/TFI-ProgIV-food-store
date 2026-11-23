import type { ReactNode } from "react";

type EstadoVacioProps = {
  mensaje: string;
  children?: ReactNode; // acción sugerida, por ejemplo el botón "Nueva categoría"
};

function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-12 text-center dark:border-gray-600 dark:bg-gray-800">
      <p className="text-gray-500 dark:text-gray-400">{mensaje}</p>
      {children}
    </div>
  );
}

export default EstadoVacio;