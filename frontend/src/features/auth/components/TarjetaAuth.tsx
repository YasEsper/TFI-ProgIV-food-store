import type { FormEvent, ReactNode } from "react";
import Button from "@/shared/components/ui/Button";

type TarjetaAuthProps = {
  titulo: string;
  error: string | null;
  enviando: boolean;
  textoBoton: string;
  onSubmit: () => void;
  pie: ReactNode; // enlace a la otra página (login ↔ registro)
  children: ReactNode; // los campos del formulario
};

// Marco común de las páginas de login y registro: tarjeta centrada, error de la API y botón
function TarjetaAuth({ titulo, error, enviando, textoBoton, onSubmit, pie, children }: TarjetaAuthProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // sin recargar la página
    onSubmit();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary dark:text-indigo-300">Food Store</p>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{titulo}</h1>
        </div>

        {children}

        {error && (
          <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" disabled={enviando} className="w-full">
          {enviando ? "Enviando..." : textoBoton}
        </Button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300">{pie}</p>
      </form>
    </main>
  );
}

export default TarjetaAuth;
