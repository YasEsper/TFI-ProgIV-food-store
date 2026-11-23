import type { Table } from "@tanstack/react-table";
import type { Producto } from "../types/producto.types";
import Button from "@/shared/components/ui/Button";
import Tabla from "@/shared/components/ui/Tabla";

type ProductoListProps = {
  table: Table<Producto>;
  puedeEditar: boolean; // solo el admin ve Editar y Eliminar
  onEditar: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
};

function ProductoList({ table, puedeEditar, onEditar, onEliminar }: ProductoListProps) {
  const acciones = (producto: Producto) => (
    <>
      <Button variante="warning" tamano="sm" onClick={() => onEditar(producto)}>
        Editar
      </Button>
      <Button variante="danger" tamano="sm" onClick={() => onEliminar(producto)}>
        Eliminar
      </Button>
    </>
  );

  return <Tabla table={table} acciones={puedeEditar ? acciones : undefined} />;
}

export default ProductoList;
