import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useLocation, useNavigate, type Location } from "react-router-dom";
import CampoTexto from "@/shared/components/ui/CampoTexto";
import TarjetaAuth from "../components/TarjetaAuth";
import { useAuth } from "../hooks/useAuth";
import type { Credenciales } from "../types/auth.types";

const CREDENCIALES_VACIAS: Credenciales = { email: "", password: "" };
const DESTINO_POR_DEFECTO = "/categories";

// Lo que pueden mandar otras pantallas al redirigir al login
type EstadoLogin = {
  from?: Location; // ProtectedRoute: la pantalla que se pidió sin sesión
  registrado?: boolean; // RegisterPage: aviso de cuenta creada
} | null;

const requerido = (mensaje: string) => ({ value }: { value: string }) =>
  value.trim() === "" ? mensaje : undefined;

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const estado = location.state as EstadoLogin;
  const destino = estado?.from?.pathname ?? DESTINO_POR_DEFECTO;

  const form = useForm({
    defaultValues: CREDENCIALES_VACIAS,
    canSubmitWhenInvalid: true,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.email.trim(), value.password);
        navigate(destino, { replace: true }); // vuelve a la pantalla que se había pedido
      } catch (e) {
        // Credenciales incorrectas o cuenta desactivada: el mensaje se muestra sin recargar
        setError(e instanceof Error ? e.message : "No se pudo iniciar sesión");
      }
    },
  });

  // Con sesión activa, el login no tiene sentido
  if (isAuthenticated) return <Navigate to={destino} replace />;

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(enviando) => (
        <TarjetaAuth
          titulo="Iniciar sesión"
          error={error}
          enviando={enviando}
          textoBoton="Ingresar"
          onSubmit={() => form.handleSubmit()}
          pie={
            <>
              ¿No tenés cuenta?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline dark:text-indigo-300">
                Registrate
              </Link>
            </>
          }
        >
          {estado?.registrado && (
            <p role="status" className="rounded bg-green-100 px-3 py-2 text-sm text-green-700">
              Cuenta creada. Ya podés iniciar sesión.
            </p>
          )}
          <form.Field name="email" validators={{ onChange: requerido("El email es obligatorio") }}>
            {(field) => <CampoTexto field={field} label="Email" tipo="email" autoComplete="username" />}
          </form.Field>
          <form.Field name="password" validators={{ onChange: requerido("La contraseña es obligatoria") }}>
            {(field) => (
              <CampoTexto field={field} label="Contraseña" tipo="password" autoComplete="current-password" />
            )}
          </form.Field>
        </TarjetaAuth>
      )}
    </form.Subscribe>
  );
}

export default LoginPage;
