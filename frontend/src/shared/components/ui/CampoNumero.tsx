import type { AnyFieldApi } from "@tanstack/react-form";

type CampoNumeroProps = {
  field: AnyFieldApi;
  label: string;
  min?: number;
  step?: number;
};

// Input numérico conectado a TanStack Form. Si se borra el número, el valor queda en NaN
// para que el validador de la página lo marque como obligatorio.
function CampoNumero({ field, label, min, step }: CampoNumeroProps) {
  const { meta } = field.state;
  const errores = meta.isTouched ? meta.errors : [];
  const valor: number = field.state.value;

  return (
    <div>
      <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <input
        id={field.name}
        name={field.name}
        type="number"
        min={min}
        step={step}
        value={Number.isNaN(valor) ? "" : valor}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.valueAsNumber)}
        aria-invalid={errores.length > 0}
        className={`w-full rounded border bg-white px-3 py-2 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
          errores.length > 0 ? "border-danger" : "border-gray-300 dark:border-gray-600"
        }`}
      />
      {errores.map((error) => (
        <p key={String(error)} className="mt-1 text-xs text-danger">
          {String(error)}
        </p>
      ))}
    </div>
  );
}

export default CampoNumero;
