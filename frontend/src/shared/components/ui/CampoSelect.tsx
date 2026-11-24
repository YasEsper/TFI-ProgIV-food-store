import type { AnyFieldApi } from "@tanstack/react-form";

export type Opcion = { valor: number; texto: string };

type CampoSelectProps = {
  field: AnyFieldApi;
  label: string;
  opciones: Opcion[];
  textoVacio: string; // la opción inicial, sin elegir (valor 0)
};

// Lista desplegable conectada a TanStack Form. El valor es un número (por ejemplo, un id).
function CampoSelect({ field, label, opciones, textoVacio }: CampoSelectProps) {
  const { meta } = field.state;
  const errores = meta.isTouched ? meta.errors : [];

  return (
    <div>
      <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <select
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(Number(e.target.value))}
        aria-invalid={errores.length > 0}
        className={`w-full rounded border bg-white px-3 py-2 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
          errores.length > 0 ? "border-danger" : "border-gray-300 dark:border-gray-600"
        }`}
      >
        <option value={0}>{textoVacio}</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
      {errores.map((error) => (
        <p key={String(error)} className="mt-1 text-xs text-danger">
          {String(error)}
        </p>
      ))}
    </div>
  );
}

export default CampoSelect;
