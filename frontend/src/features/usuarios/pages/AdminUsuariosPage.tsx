import { useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import Button from "@/shared/components/ui/Button";
import EstadoCargando from "@/shared/components/ui/EstadoCargando";
import EstadoError from "@/shared/components/ui/EstadoError";
import Insignia from "@/shared/components/ui/Insignia";
import Tabla from "@/shared/components/ui/Tabla";
import { useUsuarios } from "../hooks/useUsuarios";
import { useAuth } from "@/features/auth";
import type { UsuarioPublico } from "@/features/auth";

const FILAS_POR_PAGINA = 10;
const COLUMNAS: ColumnDef<UsuarioPublico>[] = [
  { accessorKey: "username", header: "Usuario" },
  { accessorKey: "full_name", header: "Nombre" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Rol" },
  {
    accessorKey: "disabled",
    header: "Estado",
    cell: ({ getValue }) =>
      getValue<boolean>() ? <Insignia>Desactivado</Insignia> : <Insignia color="verde">Activo</Insignia>,
  },
];

// Solo admin: la ruta la protege ProtectedRoute y el backend responde 403 a un user
function AdminUsuariosPage() {
  const { usuario: sesion } = useAuth();
  const { usuarios, isLoading, isError, refetch, cambiarEstado } = useUsuarios();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: usuarios,
    columns: COLUMNAS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: FILAS_POR_PAGINA } },
  });

  // En la fila del usuario de la sesión no se muestra Desactivar: se quedaría sin acceso
  const acciones = (usuario: UsuarioPublico) =>
    usuario.id === sesion?.id ? (
      <span className="text-xs text-gray-400">Tu cuenta</span>
    ) : (
      <Button
        variante={usuario.disabled ? "primary" : "danger"}
        tamano="sm"
        disabled={cambiarEstado.isPending}
        onClick={() => cambiarEstado.mutate({ id: usuario.id, activar: usuario.disabled })}
      >
        {usuario.disabled ? "Activar" : "Desactivar"}
      </Button>
    );

  const renderListado = () => {
    if (isLoading) return <EstadoCargando filas={FILAS_POR_PAGINA} />;
    if (isError) {
      return <EstadoError mensaje="No se pudieron cargar los usuarios." onReintentar={() => refetch()} />;
    }
    return <Tabla table={table} acciones={acciones} />;
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="mb-6 text-2xl font-semibold">Usuarios</h2>
      {renderListado()}
    </main>
  );
}

export default AdminUsuariosPage;
