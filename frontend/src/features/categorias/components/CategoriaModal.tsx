import type { ReactNode } from "react";
import ModalFormulario from "@/shared/components/ui/ModalFormulario";

type CategoriaModalProps = {
  abierto: boolean;
  esEdicion: boolean;
  error: string | null;
  guardando: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
};

// Alta y edición usan el mismo modal: cambia el título y la mutación que ejecuta la página
function CategoriaModal({ esEdicion, ...props }: CategoriaModalProps) {
  return <ModalFormulario titulo={esEdicion ? "Editar categoría" : "Nueva categoría"} {...props} />;
}

export default CategoriaModal;