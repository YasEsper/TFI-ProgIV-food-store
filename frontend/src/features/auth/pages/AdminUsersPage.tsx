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
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useAuth } from "../hooks/useAuth";
import type { UsuarioPublico } from "../types/auth.types";

const FILAS_POR_PAGINA = 10;
const COLUMNAS: ColumnDef<UsuarioPublico>[] = [
  { accessorKey: "apellido", header: "Apellido" },
  { accessorKey: "nombre", header: "Nombre" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "roles",
    header: "Roles",
    enableSorting: false,
    cell: ({ getValue }) => getValue<string[]>().join(", ") || "Sin rol vigente",
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ getValue }) =>
      getValue<boolean>() ? <Insignia color="verde">Activo</Insignia> : <Insignia>Desactivado</Insignia>,
  },
];

// Solo admin: la ruta la protege ProtectedRoute y el backend responde 403 a un user
function AdminUsersPage() {
  const { user } = useAuth();
  const { usuarios, isLoading, isError, refetch, cambiarEstado } = useAdminUsers();
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

  // El admin no se desactiva a sí mismo desde acá: se quedaría sin acceso
  const acciones = (usuario: UsuarioPublico) =>
    usuario.id === user?.id ? (
      <span className="text-xs text-gray-400">Tu cuenta</span>
    ) : (
      <Button
        variante={usuario.activo ? "danger" : "primary"}
        tamano="sm"
        disabled={cambiarEstado.isPending}
        onClick={() => cambiarEstado.mutate({ id: usuario.id, activar: !usuario.activo })}
      >
        {usuario.activo ? "Desactivar" : "Activar"}
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

export default AdminUsersPage;
