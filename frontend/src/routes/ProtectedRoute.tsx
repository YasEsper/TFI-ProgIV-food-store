import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore, type Rol } from "@/features/auth";

type ProtectedRouteProps = {
  allowedRoles?: Rol[]; // sin roles: alcanza con tener sesión
};

// Guardián de rutas: se usa como ruta padre. Si deja pasar, muestra la ruta hija con <Outlet />.
// Ordena la navegación; la protección real está en el backend (401 y 403).
function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const hasRole = useAuthStore((state) => state.hasRole);
  const location = useLocation();

  // 1. Mientras checkSession confirma la sesión, todavía no se sabe si hay que redirigir
  if (cargando) {
    return (
      <div role="status" className="flex min-h-[50vh] items-center justify-center text-gray-500">
        Verificando sesión...
      </div>
    );
  }

  // 2. Sin sesión: al login, recordando la pantalla pedida para volver después
  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Con sesión pero sin un rol permitido: acceso denegado
  if (allowedRoles && !hasRole(...allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Sesión válida y rol permitido
  return <Outlet />;
}

export default ProtectedRoute;
