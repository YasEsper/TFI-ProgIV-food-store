import type { ReactNode } from "react";
import { flexRender, type Table } from "@tanstack/react-table";
import Button from "./Button";

type TablaProps<T> = {
  table: Table<T>;
  // Botones de la última columna, los define cada entidad. Sin acciones no hay columna:
  // así se oculta la edición a quien no es admin
  acciones?: (fila: T) => ReactNode;
};

const FLECHAS = { asc: " ▲", desc: " ▼" } as const;

// Tabla genérica: TanStack Table calcula orden y paginación; acá solo se dibuja el marcado
function Tabla<T>({ table, acciones }: TablaProps<T>) {
  const { pageIndex } = table.getState().pagination;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const titulo = flexRender(header.column.columnDef.header, header.getContext());
                  const orden = header.column.getIsSorted();
                  return (
                    <th key={header.id} className="px-4 py-3 font-semibold">
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="cursor-pointer select-none hover:text-primary"
                        >
                          {titulo}
                          {orden ? FLECHAS[orden] : ""}
                        </button>
                      ) : (
                        titulo
                      )}
                    </th>
                  );
                })}
                {acciones && <th className="px-4 py-3 text-right font-semibold">Acciones</th>}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {acciones && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">{acciones(row.original)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
        <span>
          Página {pageIndex + 1} de {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <Button
            variante="secondary"
            tamano="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variante="secondary"
            tamano="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Tabla;