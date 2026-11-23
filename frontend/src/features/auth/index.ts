// API pública de la feature de autenticación. Las otras carpetas importan solo desde acá.
export { useAuthStore } from "./store/authStore";
export { useAuth } from "./hooks/useAuth";
export { default as LoginPage } from "./pages/LoginPage";
export { default as RegisterPage } from "./pages/RegisterPage";
export { default as AdminUsersPage } from "./pages/AdminUsersPage";
export type { Rol, UsuarioAuth } from "./types/auth.types";
