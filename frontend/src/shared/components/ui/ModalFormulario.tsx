import type { FormEvent, ReactNode } from "react";
import Button from "./Button";

type ModalFormularioProps = {
  abierto: boolean;
  titulo: string;
  error: string | null;
  guardando: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode; // los campos del formulario, los arma cada página
};

// Marco común de los modales de alta y edición: fondo, título, error de la API y botones
function ModalFormulario({
  abierto,
  titulo,
  error,
  guardando,
  onSubmit,
  onClose,
  children,
}: ModalFormularioProps) {
  if (!abierto) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
      >
        <h2 className="text-xl font-semibold">{titulo}</h2>

        {children}

        {error && (
          <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variante="secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ModalFormulario;