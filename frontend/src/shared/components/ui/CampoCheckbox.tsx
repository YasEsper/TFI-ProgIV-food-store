import type { AnyFieldApi } from "@tanstack/react-form";

type CampoCheckboxProps = {
  field: AnyFieldApi;
  label: string;
};

// Casilla de verificación conectada a un campo booleano de TanStack Form
function CampoCheckbox({ field, label }: CampoCheckboxProps) {
  return (
    <label htmlFor={field.name} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
      <input
        id={field.name}
        name={field.name}
        type="checkbox"
        checked={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
      {label}
    </label>
  );
}

export default CampoCheckbox;
