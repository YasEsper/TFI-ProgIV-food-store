import type { Table } from "@tanstack/react-table";
import type { Producto } from "../types/producto.types";
import Button from "@/shared/components/ui/Button";
import Tabla from "@/shared/components/ui/Tabla";

type ProductoListProps = {
  table: Table<Producto>;
  onEditar: (producto: Producto) => void;
  onStock: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
};

function ProductoList({ table, onEditar, onStock, onEliminar }: ProductoListProps) {
  const acciones = (producto: Producto) => (
    <>
      <Button variante="secondary" tamano="sm" onClick={() => onStock(producto)}>
        Stock
      </Button>
      <Button variante="warning" tamano="sm" onClick={() => onEditar(producto)}>
        Editar
      </Button>
      <Button variante="danger" tamano="sm" onClick={() => onEliminar(producto)}>
        Eliminar
      </Button>
    </>
  );

  return <Tabla table={table} acciones={acciones} />;
}

export default ProductoList;
