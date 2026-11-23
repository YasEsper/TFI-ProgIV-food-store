import type { ReactNode } from "react";
import ModalFormulario from "@/shared/components/ui/ModalFormulario";

type IngredienteModalProps = {
  abierto: boolean;
  esEdicion: boolean;
  error: string | null;
  guardando: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
};

// Alta y edición usan el mismo modal: cambia el título y la mutación que ejecuta la página
function IngredienteModal({ esEdicion, ...props }: IngredienteModalProps) {
  return (
    <ModalFormulario titulo={esEdicion ? "Editar ingrediente" : "Nuevo ingrediente"} {...props} />
  );
}

export default IngredienteModal;