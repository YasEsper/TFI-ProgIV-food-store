import type { ReactNode } from "react";
import ModalFormulario from "@/shared/components/ui/ModalFormulario";

type ProductoModalProps = {
  abierto: boolean;
  esEdicion: boolean;
  error: string | null;
  guardando: boolean;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
};

// Alta y edición usan el mismo modal: cambia el título y la mutación que ejecuta la página
function ProductoModal({ esEdicion, ...props }: ProductoModalProps) {
  return <ModalFormulario titulo={esEdicion ? "Editar producto" : "Nuevo producto"} {...props} />;
}

export default ProductoModal;
