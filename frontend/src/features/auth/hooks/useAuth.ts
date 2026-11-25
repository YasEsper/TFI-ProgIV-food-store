import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/cartStore";
import { registrarse } from "../services/auth.service";
import { useAuthStore } from "@/store/authStore";

// Inicio y cierre de sesión, registro y lectura del store de autenticación
export function useAuth() {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const login = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const isAdmin = useAuthStore((state) => state.hasRole("admin"));
  const vaciarCarrito = useCartStore((state) => state.vaciar);

  const logout = async () => {
    await logoutStore();
    queryClient.clear(); // que el próximo usuario no vea datos cacheados del anterior
    vaciarCarrito();
  };

  return {
    usuario,
    cargando,
    isAuthenticated: usuario !== null,
    isAdmin,
    login,
    logout,
    register: registrarse,
  };
}
