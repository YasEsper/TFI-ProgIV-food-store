import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "danger" | "warning";
type Tamano = "sm" | "md";

// Cada variante usa un color del design system definido en index.css
const VARIANTES: Record<Variante, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
  danger: "bg-danger text-white hover:bg-danger-hover",
  warning: "bg-warning text-white hover:bg-warning-hover",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamano?: Tamano;
};

function Button({
  variante = "primary",
  tamano = "md",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    />
  );
}

export default Button;