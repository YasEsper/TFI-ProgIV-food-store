import type { Table } from "@tanstack/react-table";
import type { Ingrediente } from "../types/ingrediente.types";
import Button from "@/shared/components/ui/Button";
import Tabla from "@/shared/components/ui/Tabla";

type IngredienteListProps = {
  table: Table<Ingrediente>;
  puedeEditar: boolean; // solo el admin ve Editar y Eliminar
  onEditar: (ingrediente: Ingrediente) => void;
  onEliminar: (ingrediente: Ingrediente) => void;
};

function IngredienteList({ table, puedeEditar, onEditar, onEliminar }: IngredienteListProps) {
  const acciones = (ingrediente: Ingrediente) => (
    <>
      <Button variante="warning" tamano="sm" onClick={() => onEditar(ingrediente)}>
        Editar
      </Button>
      <Button variante="danger" tamano="sm" onClick={() => onEliminar(ingrediente)}>
        Eliminar
      </Button>
    </>
  );

  return <Tabla table={table} acciones={puedeEditar ? acciones : undefined} />;
}

export default IngredienteList;
