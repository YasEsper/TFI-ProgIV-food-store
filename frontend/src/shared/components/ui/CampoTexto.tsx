import type { ChangeEvent } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

type CampoTextoProps = {
  field: AnyFieldApi;
  label: string;
  multilinea?: boolean;
  maxLength?: number;
  tipo?: "text" | "email" | "password" | "tel";
  autoComplete?: string;
};

// Conecta un input con su campo de TanStack Form y muestra los errores de ese campo
function CampoTexto({ field, label, multilinea = false, maxLength, tipo = "text", autoComplete }: CampoTextoProps) {
  const { meta } = field.state;
  // Los errores aparecen recién cuando el usuario tocó el campo o intentó guardar
  const errores = meta.isTouched ? meta.errors : [];

  const propsComunes = {
    id: field.name,
    name: field.name,
    value: field.state.value,
    maxLength,
    onBlur: field.handleBlur,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      field.handleChange(e.target.value),
    "aria-invalid": errores.length > 0,
    className: `w-full rounded border bg-white px-3 py-2 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary ${
      errores.length > 0 ? "border-danger" : "border-gray-300 dark:border-gray-600"
    }`,
  };

  return (
    <div>
      <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      {multilinea ? (
        <textarea rows={3} {...propsComunes} />
      ) : (
        <input type={tipo} autoComplete={autoComplete} {...propsComunes} />
      )}
      {errores.map((error) => (
        <p key={String(error)} className="mt-1 text-xs text-danger">
          {String(error)}
        </p>
      ))}
    </div>
  );
}

export default CampoTexto;