import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import ThemeToggle from "./ThemeToggle";
import Button from "./ui/Button";

const estiloEnlace = ({ isActive }: { isActive: boolean }) =>
  `hover:underline ${isActive ? "font-semibold underline" : ""}`;

// Barra superior: enlaces según el rol, tema, datos del usuario y cierre de sesión
function Navbar() {
  const { usuario, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!usuario) return null;

  const cerrarSesion = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-primary text-white shadow dark:bg-gray-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <h1 className="text-xl font-bold">Food Store</h1>
          {/* El acceso al panel solo lo ve el admin (las rutas igual están protegidas) */}
          {isAdmin && (
            <>
              <NavLink to="/admin/categorias" className={estiloEnlace}>
                Categorías
              </NavLink>
              <NavLink to="/admin/productos" className={estiloEnlace}>
                Productos
              </NavLink>
              <NavLink to="/admin/usuarios" className={estiloEnlace}>
                Usuarios
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="text-right text-sm leading-tight">
            <p className="font-medium">{usuario.full_name}</p>
            <p className="text-indigo-200 dark:text-gray-400">{usuario.role}</p>
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
