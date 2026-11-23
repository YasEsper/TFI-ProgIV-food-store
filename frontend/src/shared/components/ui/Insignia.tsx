import type { ReactNode } from "react";

type Color = "verde" | "gris";

const COLORES: Record<Color, string> = {
  verde: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  gris: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

// Etiqueta corta para estados (Activo, Disponible...)
function Insignia({ color = "gris", children }: { color?: Color; children: ReactNode }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${COLORES[color]}`}>{children}</span>;
}

export default Insignia;
