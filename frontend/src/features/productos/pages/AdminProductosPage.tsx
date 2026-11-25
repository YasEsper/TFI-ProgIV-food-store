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
import { useCategorias } from "@/features/categorias";
import ConfirmModal from "@/shared/components/ConfirmModal";
import Button from "@/shared/components/ui/Button";
import CampoCheckbox from "@/shared/components/ui/CampoCheckbox";
import CampoNumero from "@/shared/components/ui/CampoNumero";
import CampoSelect from "@/shared/components/ui/CampoSelect";
import CampoTexto from "@/shared/components/ui/CampoTexto";
import EstadoCargando from "@/shared/components/ui/EstadoCargando";
import EstadoError from "@/shared/components/ui/EstadoError";
import EstadoVacio from "@/shared/components/ui/EstadoVacio";
import Insignia from "@/shared/components/ui/Insignia";
import ModalFormulario from "@/shared/components/ui/ModalFormulario";
import { formatoPrecio } from "@/shared/formato";
import ProductoList from "../components/ProductoList";
import ProductoModal from "../components/ProductoModal";
import { useProductos } from "../hooks/useProductos";
import type { Producto, ProductoInput, StockInput } from "../types/producto.types";

// Pantalla del panel: la ruta es solo para admin (ProtectedRoute) y el backend responde 403 a un user.
// Fuera del componente: referencias estables, TanStack Table no las recalcula en cada render
const COLUMNAS: ColumnDef<Producto>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { id: "categoria", accessorFn: (producto) => producto.categoria.nombre, header: "Categoría" },
  {
    accessorKey: "precio_base",
    header: "Precio",
    cell: ({ getValue }) => formatoPrecio(getValue<number>()),
  },
  { accessorKey: "stock", header: "Stock" },
  {
    accessorKey: "disponible",
    header: "Disponible",
    cell: ({ getValue }) =>
      getValue<boolean>() ? <Insignia color="verde">Sí</Insignia> : <Insignia>No</Insignia>,
  },
];
const FILAS_POR_PAGINA = 5;

const PRODUCTO_VACIO: ProductoInput = {
  categoria_id: 0,
  nombre: "",
  descripcion: "",
  precio_base: 0,
  imagen_url: "",
  stock: 0,
  disponible: true,
};

const STOCK_VACIO: StockInput = { stock: 0, disponible: true };

// Las mismas reglas que valida el backend, para avisar antes de enviar
const validarNombre = ({ value }: { value: string }) =>
  value.trim() === "" ? "El nombre es obligatorio" : undefined;

const validarCategoria = ({ value }: { value: number }) =>
  value === 0 ? "Elegí una categoría" : undefined;

const validarNoNegativo = (campo: string) => ({ value }: { value: number }) => {
  if (Number.isNaN(value)) return `${campo} es obligatorio`;
  if (value < 0) return `${campo} no puede ser negativo`;
  return undefined;
};

const validarStock = ({ value }: { value: number }) =>
  validarNoNegativo("El stock")({ value }) ?? (Number.isInteger(value) ? undefined : "El stock es un número entero");

function AdminProductosPage() {
  const { productos, isLoading, isError, refetch, crear, actualizar, cambiarStock, eliminar } = useProductos();
  const { categorias } = useCategorias();

  // Estado de la interfaz (no datos del servidor)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [productoStock, setProductoStock] = useState<Producto | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Tabla: TanStack Table ordena y pagina del lado del cliente los productos que trae el hook
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
      categoria_id: producto.categoria_id,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? "",
      precio_base: producto.precio_base,
      imagen_url: producto.imagen_url ?? "",
      stock: producto.stock,
      disponible: producto.disponible,
    }, { keepDefaultValues: true }); // si no, useForm vuelve a poner PRODUCTO_VACIO en el siguiente render
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
      actualizar.mutate({ id: productoSeleccionado.id, datos }, { onSuccess: cerrarModal });
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

  // Stock y disponibilidad: formulario propio que usa PATCH /productos/{id}/stock
  const formStock = useForm({
    defaultValues: STOCK_VACIO,
    canSubmitWhenInvalid: true,
    onSubmit: ({ value }) => {
      if (!productoStock) return;
      cambiarStock.mutate({ id: productoStock.id, datos: value }, { onSuccess: () => setProductoStock(null) });
    },
  });

  const abrirStock = (producto: Producto) => {
    cambiarStock.reset();
    formStock.reset({ stock: producto.stock, disponible: producto.disponible }, { keepDefaultValues: true });
    setProductoStock(producto);
  };

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
          <Button onClick={abrirCrear}>+ Nuevo producto</Button>
        </EstadoVacio>
      );
    }
    return <ProductoList table={table} onEditar={abrirEditar} onStock={abrirStock} onEliminar={pedirEliminar} />;
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Administrar productos</h2>
        <Button onClick={abrirCrear}>+ Nuevo producto</Button>
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
        <form.Field name="categoria_id" validators={{ onChange: validarCategoria }}>
          {(field) => (
            <CampoSelect
              field={field}
              label="Categoría"
              textoVacio="Elegí una categoría"
              opciones={categorias.map((c) => ({ valor: c.id, texto: c.nombre }))}
            />
          )}
        </form.Field>
        <form.Field name="descripcion">
          {(field) => <CampoTexto field={field} label="Descripción (opcional)" multilinea maxLength={255} />}
        </form.Field>
        <div className="grid grid-cols-2 gap-3">
          <form.Field name="precio_base" validators={{ onChange: validarNoNegativo("El precio") }}>
            {(field) => <CampoNumero field={field} label="Precio" min={0} step={0.01} />}
          </form.Field>
          <form.Field name="stock" validators={{ onChange: validarStock }}>
            {(field) => <CampoNumero field={field} label="Stock" min={0} step={1} />}
          </form.Field>
        </div>
        <form.Field name="imagen_url">
          {(field) => <CampoTexto field={field} label="URL de la imagen (opcional)" maxLength={500} />}
        </form.Field>
        <form.Field name="disponible">
          {(field) => <CampoCheckbox field={field} label="Disponible para la venta" />}
        </form.Field>
      </ProductoModal>

      <ModalFormulario
        abierto={productoStock !== null}
        titulo={`Stock de ${productoStock?.nombre ?? ""}`}
        error={cambiarStock.error?.message ?? null}
        guardando={cambiarStock.isPending}
        onSubmit={() => formStock.handleSubmit()}
        onClose={() => setProductoStock(null)}
      >
        <formStock.Field name="stock" validators={{ onChange: validarStock }}>
          {(field) => <CampoNumero field={field} label="Stock" min={0} step={1} />}
        </formStock.Field>
        <formStock.Field name="disponible">
          {(field) => <CampoCheckbox field={field} label="Disponible para la venta" />}
        </formStock.Field>
      </ModalFormulario>

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

export default AdminProductosPage;
