import Button from "./Button";

type EstadoErrorProps = {
  mensaje: string;
  onReintentar: () => void;
};

function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center dark:border-red-800 dark:bg-red-950"
    >
      <p className="text-red-700 dark:text-red-300">{mensaje}</p>
      <Button variante="danger" onClick={onReintentar}>
        Reintentar
      </Button>
    </div>
  );
}

export default EstadoError;