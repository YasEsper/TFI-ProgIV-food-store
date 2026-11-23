// Nombres de los roles que carga el seed del backend
export type Rol = "admin" | "user";

// Usuario autenticado tal como lo guarda el AuthStore (sin token: viaja en la cookie)
export interface UsuarioAuth {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles: Rol[]; // solo los roles vigentes
}

// Respuesta de GET /auth/me y de GET /auth/admin/usuarios (UserPublic del backend)
export interface UsuarioPublico extends UsuarioAuth {
  celular: string | null;
  activo: boolean;
}

// Formulario de login
export interface Credenciales {
  email: string;
  password: string;
}

// Formulario de registro (POST /auth/register)
export interface RegistroInput {
  nombre: string;
  apellido: string;
  email: string;
  celular: string; // opcional: vacío se manda como null
  password: string;
}

// Respuesta de login y logout
export interface Mensaje {
  mensaje: string;
}
