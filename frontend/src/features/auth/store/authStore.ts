import { create } from "zustand";
import { cerrarSesion, iniciarSesion, obtenerPerfil } from "../services/auth.service";
import type { Rol, UsuarioAuth, UsuarioPublico } from "../types/auth.types";

// checking: al arrancar, todavía no se confirmó la sesión con /auth/me
type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  user: UsuarioAuth | null;
  status: AuthStatus;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  hasRole: (...roles: Rol[]) => boolean;
}

// Del usuario que devuelve la API se guardan solo los datos que usa la interfaz
const aUsuarioAuth = ({ id, nombre, apellido, email, roles }: UsuarioPublico): UsuarioAuth => ({
  id,
  nombre,
  apellido,
  email,
  roles,
});

// Store global de la sesión. Sin persist (RA-09): el token viaja en la cookie HttpOnly
// y al recargar el usuario se recupera con GET /auth/me (checkAuth).
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  status: "checking",

  checkAuth: async () => {
    try {
      const perfil = await obtenerPerfil();
      set({ user: aUsuarioAuth(perfil), status: "authenticated" });
    } catch {
      set({ user: null, status: "unauthenticated" });
    }
  },

  login: async (email, password) => {
    await iniciarSesion({ email, password }); // si falla, el error llega a LoginPage
    const perfil = await obtenerPerfil();
    set({ user: aUsuarioAuth(perfil), status: "authenticated" });
  },

  logout: async () => {
    try {
      await cerrarSesion();
    } finally {
      set({ user: null, status: "unauthenticated" }); // aunque falle la petición, se sale de la sesión
    }
  },

  // La usa el interceptor de Axios cuando el backend responde 401
  clearSession: () => set({ user: null, status: "unauthenticated" }),

  // true si el usuario tiene al menos uno de los roles (el backend devuelve una lista de roles vigentes)
  hasRole: (...roles) => {
    const user = get().user;
    return user !== null && user.roles.some((rol) => roles.includes(rol));
  },
}));
