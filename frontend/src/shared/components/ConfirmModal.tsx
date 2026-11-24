import Button from "./ui/Button";

type ConfirmModalProps = {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  error: string | null;
  procesando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  textoConfirmar?: string; // por defecto "Eliminar"; en pedidos, "Cancelar pedido"
};

// Confirmación propia antes de eliminar o cancelar (en lugar de window.confirm)
function ConfirmModal({
  abierto,
  titulo,
  mensaje,
  error,
  procesando,
  onConfirmar,
  onCancelar,
  textoConfirmar = "Eliminar",
}: ConfirmModalProps) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-2 text-lg font-semibold">{titulo}</h2>
        <p className="text-gray-600 dark:text-gray-300">{mensaje}</p>

        {error && <p className="mt-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variante="secondary" onClick={onCancelar} disabled={procesando}>
            Volver
          </Button>
          <Button variante="danger" onClick={onConfirmar} disabled={procesando}>
            {procesando ? "Procesando..." : textoConfirmar}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
