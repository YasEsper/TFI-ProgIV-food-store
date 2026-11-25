import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cerrarSesion, iniciarSesion, obtenerPerfil } from "@/features/auth/services/auth.service";
import type { Rol, UsuarioAuth, UsuarioPublico } from "@/features/auth/types/auth.types";

interface AuthState {
  usuario: UsuarioAuth | null;
  cargando: boolean; // true mientras checkSession confirma la sesión con /auth/me
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
  hasRole: (...roles: Rol[]) => boolean;
}

// Del usuario que devuelve la API se guardan solo los datos que usa la interfaz
const aUsuarioAuth = ({ id, username, full_name, email, role }: UsuarioPublico): UsuarioAuth => ({
  id,
  username,
  full_name,
  email,
  role,
});

// Estado de la sesión. persist guarda en localStorage SOLO el usuario (partialize):
// nunca el token, que viaja en la cookie HttpOnly. Al montar la app, checkSession
// confirma con /auth/me que la cookie sigue vigente.
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await iniciarSesion({ username, password }); // si falla, el error llega a LoginPage
        const perfil = await obtenerPerfil();
        set({ usuario: aUsuarioAuth(perfil), cargando: false });
      },

      logout: async () => {
        try {
          await cerrarSesion();
        } finally {
          set({ usuario: null }); // aunque falle la petición, se sale de la sesión
        }
      },

      checkSession: async () => {
        try {
          const perfil = await obtenerPerfil();
          set({ usuario: aUsuarioAuth(perfil), cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      // La usa el interceptor de Axios ante un 401 o una cuenta desactivada
      clearSession: () => set({ usuario: null, cargando: false }),

      hasRole: (...roles) => {
        const usuario = get().usuario;
        return usuario !== null && roles.includes(usuario.role);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
