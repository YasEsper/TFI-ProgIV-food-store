import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useCartStore } from "@/store/cartStore";
import ThemeToggle from "./ThemeToggle";
import Button from "./ui/Button";

const estiloEnlace = ({ isActive }: { isActive: boolean }) =>
  `hover:underline ${isActive ? "font-semibold underline" : ""}`;

// Barra superior: se ve siempre. Los enlaces cambian según haya sesión y según el rol.
function Navbar() {
  const { usuario, isAdmin, logout } = useAuth();
  const unidades = useCartStore((state) => state.items.reduce((suma, i) => suma + i.cantidad, 0));
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="bg-primary text-white shadow dark:bg-gray-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            Food Store
          </Link>
          <NavLink to="/" end className={estiloEnlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={estiloEnlace}>
            Carrito ({unidades})
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={estiloEnlace}>
              Mis pedidos
            </NavLink>
          )}
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
          {usuario ? (
            <>
              <div className="text-right text-sm leading-tight">
                <p className="font-medium">{usuario.full_name}</p>
                <p className="text-indigo-200 dark:text-gray-400">{usuario.role}</p>
              </div>
              <Button variante="secondary" tamano="sm" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={estiloEnlace}>
                Iniciar sesión
              </NavLink>
              <NavLink to="/register" className={estiloEnlace}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
