// API pública de la feature de autenticación. Las otras carpetas importan solo desde acá.
export { useAuth } from "./hooks/useAuth";
export { default as LoginPage } from "./pages/LoginPage";
export { default as RegisterPage } from "./pages/RegisterPage";
export { default as UnauthorizedPage } from "./pages/UnauthorizedPage";
export type { Rol, UsuarioAuth, UsuarioPublico } from "./types/auth.types";
