// Los dos roles del sistema
export type Rol = "admin" | "user";

// Usuario tal como lo devuelven GET /auth/me y GET /admin/usuarios (UserPublic del backend)
export interface UsuarioPublico {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

// Lo que guarda el authStore de la sesión (sin token: viaja en la cookie HttpOnly)
export type UsuarioAuth = Pick<UsuarioPublico, "id" | "username" | "full_name" | "email" | "role">;

// Formulario de login (POST /auth/token)
export interface Credenciales {
  username: string;
  password: string;
}

// Formulario de registro (POST /auth/register)
export interface RegistroInput {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

// Respuesta de login y logout
export interface Mensaje {
  message: string;
}
