import type { Table } from "@tanstack/react-table";
import type { Categoria } from "../types/categoria.types";
import Button from "@/shared/components/ui/Button";
import Tabla from "@/shared/components/ui/Tabla";

type CategoriaListProps = {
  table: Table<Categoria>;
  puedeEditar: boolean; // solo el admin ve Editar y Eliminar
  onEditar: (categoria: Categoria) => void;
  onEliminar: (categoria: Categoria) => void;
};

function CategoriaList({ table, puedeEditar, onEditar, onEliminar }: CategoriaListProps) {
  const acciones = (categoria: Categoria) => (
    <>
      <Button variante="warning" tamano="sm" onClick={() => onEditar(categoria)}>
        Editar
      </Button>
      <Button variante="danger" tamano="sm" onClick={() => onEliminar(categoria)}>
        Eliminar
      </Button>
    </>
  );

  return <Tabla table={table} acciones={puedeEditar ? acciones : undefined} />;
}

export default CategoriaList;
