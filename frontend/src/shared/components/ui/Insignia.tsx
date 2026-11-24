import type { ReactNode } from "react";

export type ColorInsignia = "verde" | "gris" | "amarillo" | "azul" | "rojo";

const COLORES: Record<ColorInsignia, string> = {
  verde: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  gris: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  amarillo: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  azul: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  rojo: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
};

// Etiqueta corta para estados (Activo, Disponible, estado del pedido...)
function Insignia({ color = "gris", children }: { color?: ColorInsignia; children: ReactNode }) {
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${COLORES[color]}`}>{children}</span>;
}

export default Insignia;
