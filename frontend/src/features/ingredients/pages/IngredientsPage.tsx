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
import IngredienteList from "../components/IngredienteList";
import IngredienteModal from "../components/IngredienteModal";
import { useIngredients } from "../hooks/useIngredients";
import type { Ingrediente, IngredienteInput } from "../types/ingrediente.types";

// Fuera del componente: referencias estables, TanStack Table no las recalcula en cada render
const COLUMNAS: ColumnDef<Ingrediente>[] = [{ accessorKey: "nombre", header: "Nombre" }];
const FILAS_POR_PAGINA = 5;
const INGREDIENTE_VACIO: IngredienteInput = { nombre: "" };

// El nombre no puede quedar vacío ni tener solo espacios
const validarNombre = ({ value }: { value: string }) =>
  value.trim() === "" ? "El nombre es obligatorio" : undefined;

function IngredientsPage() {
  const { isAdmin } = useAuth(); // crear, editar y eliminar: solo admin (el backend responde 403 igual)
  const { ingredientes, isLoading, isError, refetch, crear, actualizar, eliminar } = useIngredients();

  // Estado de la interfaz (no datos del servidor)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | null>(null);
  const [ingredienteAEliminar, setIngredienteAEliminar] = useState<Ingrediente | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Tabla: TanStack Table ordena y pagina los datos que trae el hook
  const table = useReactTable({
    data: ingredientes,
    columns: COLUMNAS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: FILAS_POR_PAGINA } },
  });

  // La mutación que corresponde al modal: editar si hay ingrediente seleccionado, si no crear
  const mutacionModal = ingredienteSeleccionado ? actualizar : crear;

  const abrirCrear = () => {
    crear.reset();
    form.reset(INGREDIENTE_VACIO);
    setIngredienteSeleccionado(null);
    setModalAbierto(true);
  };

  const abrirEditar = (ingrediente: Ingrediente) => {
    actualizar.reset();
    form.reset({ nombre: ingrediente.nombre });
    setIngredienteSeleccionado(ingrediente);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setIngredienteSeleccionado(null);
  };

  // El modal se cierra solo si el guardado sale bien; si falla, queda abierto con el error
  const guardar = (datos: IngredienteInput) => {
    if (ingredienteSeleccionado) {
      actualizar.mutate(
        { id: ingredienteSeleccionado.id, datos },
        { onSuccess: cerrarModal },
      );
    } else {
      crear.mutate(datos, { onSuccess: cerrarModal });
    }
  };

  // Formulario: TanStack Form guarda los valores, valida y recién entonces llama a guardar()
  const form = useForm({
    defaultValues: INGREDIENTE_VACIO,
    canSubmitWhenInvalid: true, // al guardar se validan y muestran todos los campos
    onSubmit: ({ value }) => guardar(value),
  });

  const pedirEliminar = (ingrediente: Ingrediente) => {
    eliminar.reset();
    setIngredienteAEliminar(ingrediente);
  };

  const confirmarEliminar = () => {
    if (!ingredienteAEliminar) return;
    eliminar.mutate(ingredienteAEliminar.id, {
      onSuccess: () => setIngredienteAEliminar(null),
    });
  };

  // Un solo estado visible a la vez: cargando, error, vacío o la tabla
  const renderListado = () => {
    if (isLoading) return <EstadoCargando filas={FILAS_POR_PAGINA} />;
    if (isError) {
      return (
        <EstadoError
          mensaje="No se pudieron cargar los ingredientes. Revisá que el backend esté levantado."
          onReintentar={() => refetch()}
        />
      );
    }
    if (ingredientes.length === 0) {
      return (
        <EstadoVacio mensaje="Todavía no hay ingredientes cargados.">
          {isAdmin && <Button onClick={abrirCrear}>+ Nuevo ingrediente</Button>}
        </EstadoVacio>
      );
    }
    return (
      <IngredienteList
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
        <h2 className="text-2xl font-semibold">Ingredientes</h2>
        {isAdmin && <Button onClick={abrirCrear}>+ Nuevo ingrediente</Button>}
      </div>

      {renderListado()}

      <IngredienteModal
        abierto={modalAbierto}
        esEdicion={ingredienteSeleccionado !== null}
        error={mutacionModal.error?.message ?? null}
        guardando={mutacionModal.isPending}
        onSubmit={() => form.handleSubmit()}
        onClose={cerrarModal}
      >
        <form.Field name="nombre" validators={{ onChange: validarNombre }}>
          {(field) => <CampoTexto field={field} label="Nombre" maxLength={100} />}
        </form.Field>
      </IngredienteModal>

      <ConfirmModal
        abierto={ingredienteAEliminar !== null}
        titulo="Eliminar ingrediente"
        mensaje={`¿Seguro que querés eliminar el ingrediente "${ingredienteAEliminar?.nombre}"?`}
        error={eliminar.error?.message ?? null}
        procesando={eliminar.isPending}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setIngredienteAEliminar(null)}
      />
    </main>
  );
}

export default IngredientsPage;