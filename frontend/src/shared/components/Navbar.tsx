import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import ThemeToggle from "./ThemeToggle";
import Button from "./ui/Button";

const estiloEnlace = ({ isActive }: { isActive: boolean }) =>
  `hover:underline ${isActive ? "font-semibold underline" : ""}`;

// Barra superior: enlaces según el rol, tema, datos del usuario y cierre de sesión
function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const cerrarSesion = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-primary text-white shadow dark:bg-gray-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Food Store</h1>
          <NavLink to="/categories" className={estiloEnlace}>
            Categorías
          </NavLink>
          <NavLink to="/ingredients" className={estiloEnlace}>
            Ingredientes
          </NavLink>
          <NavLink to="/products" className={estiloEnlace}>
            Productos
          </NavLink>
          {/* Interfaz condicional: el enlace solo lo ve el admin (la ruta igual está protegida) */}
          {isAdmin && (
            <NavLink to="/admin/users" className={estiloEnlace}>
              Usuarios
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="text-right text-sm leading-tight">
            <p className="font-medium">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-indigo-200 dark:text-gray-400">{user.roles.join(", ")}</p>
          </div>
          <Button variante="secondary" tamano="sm" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
