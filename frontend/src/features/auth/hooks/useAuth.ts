import { useQueryClient } from "@tanstack/react-query";
import { registrarse } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

// Inicio y cierre de sesión, registro y lectura del store de autenticación
export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);
  const login = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const isAdmin = useAuthStore((state) => state.hasRole("admin"));

  const logout = async () => {
    await logoutStore();
    queryClient.clear(); // que el próximo usuario no vea datos cacheados del anterior
  };

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isAdmin,
    login,
    logout,
    register: registrarse,
  };
}
