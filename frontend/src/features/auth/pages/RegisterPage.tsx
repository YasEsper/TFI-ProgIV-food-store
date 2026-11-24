import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import CampoTexto from "@/shared/components/ui/CampoTexto";
import TarjetaAuth from "../components/TarjetaAuth";
import { useAuth } from "../hooks/useAuth";
import type { RegistroInput } from "../types/auth.types";

const REGISTRO_VACIO: RegistroInput = { username: "", full_name: "", email: "", password: "" };

// Las mismas reglas que valida el backend, para avisar antes de enviar
const requerido = (mensaje: string) => ({ value }: { value: string }) =>
  value.trim() === "" ? mensaje : undefined;

const validarEmail = ({ value }: { value: string }) => {
  if (value.trim() === "") return "El email es obligatorio";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : "El email no es válido";
};

const validarPassword = ({ value }: { value: string }) => {
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (new TextEncoder().encode(value).length > 72) return "La contraseña es demasiado larga";
  return undefined;
};

function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: REGISTRO_VACIO,
    canSubmitWhenInvalid: true,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await register({ ...value, username: value.username.trim(), email: value.email.trim() });
        navigate("/login", { replace: true, state: { registrado: true } });
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo completar el registro"); // por ejemplo, usuario o email repetido (409)
      }
    },
  });

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(enviando) => (
        <TarjetaAuth
          titulo="Crear cuenta"
          error={error}
          enviando={enviando}
          textoBoton="Registrarme"
          onSubmit={() => form.handleSubmit()}
          pie={
            <>
              ¿Ya tenés cuenta?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline dark:text-indigo-300">
                Iniciá sesión
              </Link>
            </>
          }
        >
          <form.Field name="username" validators={{ onChange: requerido("El usuario es obligatorio") }}>
            {(field) => <CampoTexto field={field} label="Usuario" maxLength={50} autoComplete="username" />}
          </form.Field>
          <form.Field name="full_name" validators={{ onChange: requerido("El nombre completo es obligatorio") }}>
            {(field) => <CampoTexto field={field} label="Nombre completo" maxLength={100} autoComplete="name" />}
          </form.Field>
          <form.Field name="email" validators={{ onChange: validarEmail }}>
            {(field) => <CampoTexto field={field} label="Email" tipo="email" maxLength={254} autoComplete="email" />}
          </form.Field>
          <form.Field name="password" validators={{ onChange: validarPassword }}>
            {(field) => (
              <CampoTexto field={field} label="Contraseña" tipo="password" autoComplete="new-password" />
            )}
          </form.Field>
        </TarjetaAuth>
      )}
    </form.Subscribe>
  );
}

export default RegisterPage;
