import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import ConfirmModal from "@/shared/components/ConfirmModal";
import Button from "@/shared/components/ui/Button";
import CampoCheckbox from "@/shared/components/ui/CampoCheckbox";
import CampoNumero from "@/shared/components/ui/CampoNumero";
import CampoTexto from "@/shared/components/ui/CampoTexto";
import EstadoCargando from "@/shared/components/ui/EstadoCargando";
import EstadoError from "@/shared/components/ui/EstadoError";
import EstadoVacio from "@/shared/components/ui/EstadoVacio";
import Insignia from "@/shared/components/ui/Insignia";
import { useAuth } from "@/features/auth";
import EtiquetasCategorias from "../components/EtiquetasCategorias";
import ProductoList from "../components/ProductoList";
import ProductoModal from "../components/ProductoModal";
import { useProducts } from "../hooks/useProducts";
import type { CategoriaDeProducto, Producto, ProductoInput } from "../types/producto.types";

const formatoPrecio = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

// Fuera del componente: referencias estables, TanStack Table no las recalcula en cada render
const COLUMNAS: ColumnDef<Producto>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "descripcion", header: "Descripción" },
  {
    accessorKey: "precio_base",
    header: "Precio",
    cell: ({ getValue }) => formatoPrecio.format(getValue<number>()),
  },
  {
    accessorKey: "categorias",
    header: "Categorías",
    enableSorting: false,
    cell: ({ getValue }) => <EtiquetasCategorias categorias={getValue<CategoriaDeProducto[]>()} />,
  },
  {
    accessorKey: "disponible",
    header: "Disponible",
    cell: ({ getValue }) =>
      getValue<boolean>() ? <Insignia color="verde">Sí</Insignia> : <Insignia>No</Insignia>,
  },
];
const FILAS_POR_PAGINA = 5;

const PRODUCTO_VACIO: ProductoInput = {
  nombre: "",
  descripcion: "",
  precio_base: 0,
  disponible: true,
};

// RN-06: el nombre no puede quedar vacío ni tener solo espacios
const validarNombre = ({ value }: { value: string }) =>
  value.trim() === "" ? "El nombre es obligatorio" : undefined;

// RN-07: el precio es obligatorio y no puede ser negativo
const validarPrecio = ({ value }: { value: number }) => {
  if (Number.isNaN(value)) return "El precio es obligatorio";
  if (value < 0) return "El precio no puede ser negativo";
  return undefined;
};

function ProductsPage() {
  const { isAdmin } = useAuth(); // crear, editar y eliminar: solo admin (el backend responde 403 igual)
  const { productos, isLoading, isError, refetch, crear, actualizar, eliminar } = useProducts();

  // Estado de la interfaz (no datos del servidor)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Tabla: TanStack Table ordena y pagina los datos que trae el hook
  const table = useReactTable({
    data: productos,
    columns: COLUMNAS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: FILAS_POR_PAGINA } },
  });

  // La mutación que corresponde al modal: editar si hay producto seleccionado, si no crear
  const mutacionModal = productoSeleccionado ? actualizar : crear;

  const abrirCrear = () => {
    crear.reset();
    form.reset(PRODUCTO_VACIO);
    setProductoSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirEditar = (producto: Producto) => {
    actualizar.reset();
    form.reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio_base: producto.precio_base,
      disponible: producto.disponible,
    });
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  };

  // El modal se cierra solo si el guardado sale bien; si falla, queda abierto con el error
  const guardar = (datos: ProductoInput) => {
    if (productoSeleccionado) {
      actualizar.mutate(
        { id: productoSeleccionado.id, datos },
        { onSuccess: cerrarModal },
      );
    } else {
      crear.mutate(datos, { onSuccess: cerrarModal });
    }
  };

  // Formulario: TanStack Form guarda los valores, valida y recién entonces llama a guardar()
  const form = useForm({
    defaultValues: PRODUCTO_VACIO,
    canSubmitWhenInvalid: true, // al guardar se validan y muestran todos los campos
    onSubmit: ({ value }) => guardar(value),
  });

  const pedirEliminar = (producto: Producto) => {
    eliminar.reset();
    setProductoAEliminar(producto);
  };

  const confirmarEliminar = () => {
    if (!productoAEliminar) return;
    eliminar.mutate(productoAEliminar.id, {
      onSuccess: () => setProductoAEliminar(null),
    });
  };

  // Un solo estado visible a la vez: cargando, error, vacío o la tabla
  const renderListado = () => {
    if (isLoading) return <EstadoCargando filas={FILAS_POR_PAGINA} />;
    if (isError) {
      return (
        <EstadoError
          mensaje="No se pudieron cargar los productos. Revisá que el backend esté levantado."
          onReintentar={() => refetch()}
        />
      );
    }
    if (productos.length === 0) {
      return (
        <EstadoVacio mensaje="Todavía no hay productos cargados.">
          {isAdmin && <Button onClick={abrirCrear}>+ Nuevo producto</Button>}
        </EstadoVacio>
      );
    }
    return (
      <ProductoList
        table={table}
        puedeEditar={isAdmin}
        onEditar={abrirEditar}
        onEliminar={pedirEliminar}
      />
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Productos</h2>
        {isAdmin && <Button onClick={abrirCrear}>+ Nuevo producto</Button>}
      </div>

      {renderListado()}

      <ProductoModal
        abierto={modalAbierto}
        esEdicion={productoSeleccionado !== null}
        error={mutacionModal.error?.message ?? null}
        guardando={mutacionModal.isPending}
        onSubmit={() => form.handleSubmit()}
        onClose={cerrarModal}
      >
        <form.Field name="nombre" validators={{ onChange: validarNombre }}>
          {(field) => <CampoTexto field={field} label="Nombre" maxLength={100} />}
        </form.Field>
        <form.Field name="descripcion">
          {(field) => (
            <CampoTexto field={field} label="Descripción (opcional)" multilinea maxLength={255} />
          )}
        </form.Field>
        <form.Field name="precio_base" validators={{ onChange: validarPrecio }}>
          {(field) => <CampoNumero field={field} label="Precio" min={0} step={0.01} />}
        </form.Field>
        <form.Field name="disponible">
          {(field) => <CampoCheckbox field={field} label="Disponible para la venta" />}
        </form.Field>
      </ProductoModal>

      <ConfirmModal
        abierto={productoAEliminar !== null}
        titulo="Eliminar producto"
        mensaje={`¿Seguro que querés eliminar el producto "${productoAEliminar?.nombre}"?`}
        error={eliminar.error?.message ?? null}
        procesando={eliminar.isPending}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setProductoAEliminar(null)}
      />
    </main>
  );
}

export default ProductsPage;
