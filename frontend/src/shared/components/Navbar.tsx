import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useCartStore } from "@/store/cartStore";
import ThemeToggle from "./ThemeToggle";
import Button from "./ui/Button";

const estiloEnlace = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-1.5 hover:underline ${isActive ? "font-semibold underline" : ""}`;

// Ícono decorativo al lado del texto: alt vacío, porque el texto ya dice qué es
const Icono = ({ archivo }: { archivo: string }) => (
  <img src={`/img/${archivo}`} alt="" className="h-5 w-5" />
);

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
      {/* Ancho completo: el logo queda pegado arriba a la izquierda */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex flex-wrap items-center gap-6">
          <Link to="/" aria-label="Food Store, ir al catálogo">
            <img src="/img/logo_food_store.jpg" alt="Food Store" className="h-16 w-auto rounded-lg" />
          </Link>
          <NavLink to="/" end className={estiloEnlace}>
            <Icono archivo="icono_catalogo.png" />
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={estiloEnlace}>
            <Icono archivo="icono_carrito.png" />
            Carrito ({unidades})
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={estiloEnlace}>
              <Icono archivo="icono_pedidos.png" />
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
