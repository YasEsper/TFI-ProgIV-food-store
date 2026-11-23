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
import CampoTexto from "@/shared/components/ui/CampoTexto";
import EstadoCargando from "@/shared/components/ui/EstadoCargando";
import EstadoError from "@/shared/components/ui/EstadoError";
import EstadoVacio from "@/shared/components/ui/EstadoVacio";
import { useAuth } from "@/features/auth";
import CategoriaList from "../components/CategoriaList";
import CategoriaModal from "../components/CategoriaModal";
import { useCategories } from "../hooks/useCategories";
import type { Categoria, CategoriaInput } from "../types/categoria.types";

// Fuera del componente: referencias estables, TanStack Table no las recalcula en cada render
const COLUMNAS: ColumnDef<Categoria>[] = [
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "descripcion", header: "Descripción" },
];
const FILAS_POR_PAGINA = 5;
const CATEGORIA_VACIA: CategoriaInput = { nombre: "", descripcion: "" };

// RN-01: el nombre no puede quedar vacío ni tener solo espacios
const validarNombre = ({ value }: { value: string }) =>
  value.trim() === "" ? "El nombre es obligatorio" : undefined;

function CategoriesPage() {
  const { isAdmin } = useAuth(); // crear, editar y eliminar: solo admin (el backend responde 403 igual)
  const { categorias, isLoading, isError, refetch, crear, actualizar, eliminar } = useCategories();

  // Estado de la interfaz (no datos del servidor)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Tabla: TanStack Table ordena y pagina los datos que trae el hook
  const table = useReactTable({
    data: categorias,
    columns: COLUMNAS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: FILAS_POR_PAGINA } },
  });

  // La mutación que corresponde al modal: editar si hay categoría seleccionada, si no crear
  const mutacionModal = categoriaSeleccionada ? actualizar : crear;

  const abrirCrear = () => {
    crear.reset();
    form.reset(CATEGORIA_VACIA);
    setCategoriaSeleccionada(null);
    setModalAbierto(true);
  };

  const abrirEditar = (categoria: Categoria) => {
    actualizar.reset();
    form.reset({ nombre: categoria.nombre, descripcion: categoria.descripcion });
    setCategoriaSeleccionada(categoria);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCategoriaSeleccionada(null);
  };

  // El modal se cierra solo si el guardado sale bien; si falla, queda abierto con el error
  const guardar = (datos: CategoriaInput) => {
    if (categoriaSeleccionada) {
      actualizar.mutate(
        { id: categoriaSeleccionada.id, datos },
        { onSuccess: cerrarModal },
      );
    } else {
      crear.mutate(datos, { onSuccess: cerrarModal });
    }
  };

  // Formulario: TanStack Form guarda los valores, valida y recién entonces llama a guardar()
  const form = useForm({
    defaultValues: CATEGORIA_VACIA,
    canSubmitWhenInvalid: true, // al guardar se validan y muestran todos los campos
    onSubmit: ({ value }) => guardar(value),
  });

  const pedirEliminar = (categoria: Categoria) => {
    eliminar.reset();
    setCategoriaAEliminar(categoria);
  };

  const confirmarEliminar = () => {
    if (!categoriaAEliminar) return;
    eliminar.mutate(categoriaAEliminar.id, {
      onSuccess: () => setCategoriaAEliminar(null),
    });
  };

  // Un solo estado visible a la vez: cargando, error, vacío o la tabla
  const renderListado = () => {
    if (isLoading) return <EstadoCargando filas={FILAS_POR_PAGINA} />;
    if (isError) {
      return (
        <EstadoError
          mensaje="No se pudieron cargar las categorías. Revisá que el backend esté levantado."
          onReintentar={() => refetch()}
        />
      );
    }
    if (categorias.length === 0) {
      return (
        <EstadoVacio mensaje="Todavía no hay categorías cargadas.">
          {isAdmin && <Button onClick={abrirCrear}>+ Nueva categoría</Button>}
        </EstadoVacio>
      );
    }
    return (
      <CategoriaList
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
        <h2 className="text-2xl font-semibold">Categorías</h2>
        {isAdmin && <Button onClick={abrirCrear}>+ Nueva categoría</Button>}
      </div>

      {renderListado()}

      <CategoriaModal
        abierto={modalAbierto}
        esEdicion={categoriaSeleccionada !== null}
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
      </CategoriaModal>

      <ConfirmModal
        abierto={categoriaAEliminar !== null}
        titulo="Eliminar categoría"
        mensaje={`¿Seguro que querés eliminar la categoría "${categoriaAEliminar?.nombre}"?`}
        error={eliminar.error?.message ?? null}
        procesando={eliminar.isPending}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setCategoriaAEliminar(null)}
      />
    </main>
  );
}

export default CategoriesPage;