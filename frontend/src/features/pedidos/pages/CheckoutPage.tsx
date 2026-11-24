import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/shared/components/ui/Button";
import CampoTexto from "@/shared/components/ui/CampoTexto";
import EstadoVacio from "@/shared/components/ui/EstadoVacio";
import { formatoPrecio } from "@/shared/formato";
import { useCartStore } from "@/store/cartStore";
import { useCrearPedido } from "../hooks/useCrearPedido";
import type { DatosEntrega, FormaPago } from "../types/pedido.types";

const DATOS_VACIOS: DatosEntrega = { direccion_entrega: "", forma_pago: "EFECTIVO", notas: "" };

const FORMAS_PAGO: { valor: FormaPago; texto: string }[] = [
  { valor: "EFECTIVO", texto: "Efectivo" },
  { valor: "TRANSFERENCIA", texto: "Transferencia" },
];

// La misma regla que el backend (Direccion: de 5 a 200 caracteres)
const validarDireccion = ({ value }: { value: string }) =>
  value.trim().length < 5 ? "La dirección debe tener al menos 5 caracteres" : undefined;

// Ruta protegida: solo con sesión. El dueño del pedido lo pone el backend con la cookie.
function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const crear = useCrearPedido();
  const navigate = useNavigate();

  // TanStack Form valida los campos y recién entonces manda el pedido
  const form = useForm({
    defaultValues: DATOS_VACIOS,
    canSubmitWhenInvalid: true,
    onSubmit: ({ value }) => crear.mutate(value, { onSuccess: () => navigate("/mis-pedidos") }),
  });

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-semibold">Confirmar pedido</h2>
        <EstadoVacio mensaje="No hay productos en el carrito.">
          <Link to="/" className="btn bg-primary px-4 py-2 text-white hover:bg-primary-hover">
            Ver catálogo
          </Link>
        </EstadoVacio>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-4xl gap-6 px-4 py-8 md:grid-cols-2">
      <section>
        <h2 className="mb-4 text-2xl font-semibold">Confirmar pedido</h2>
        <form
          onSubmit={enviar}
          noValidate
          className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <form.Field name="direccion_entrega" validators={{ onChange: validarDireccion }}>
            {(field) => <CampoTexto field={field} label="Dirección de entrega" maxLength={200} autoComplete="street-address" />}
          </form.Field>

          <form.Field name="forma_pago">
            {(field) => (
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Forma de pago</legend>
                <div className="flex gap-4">
                  {FORMAS_PAGO.map((opcion) => (
                    <label key={opcion.valor} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={field.name}
                        value={opcion.valor}
                        checked={field.state.value === opcion.valor}
                        onChange={() => field.handleChange(opcion.valor)}
                        className="accent-primary"
                      />
                      {opcion.texto}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </form.Field>

          <form.Field name="notas">
            {(field) => <CampoTexto field={field} label="Notas (opcional)" multilinea maxLength={500} />}
          </form.Field>

          {/* Error de la API (por ejemplo, stock insuficiente): queda en pantalla y el carrito no se toca */}
          {crear.error && (
            <p role="alert" className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">
              {crear.error.message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variante="secondary" onClick={() => navigate("/carrito")} disabled={crear.isPending}>
              Volver al carrito
            </Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? "Enviando..." : "Confirmar pedido"}
            </Button>
          </div>
        </form>
      </section>

      <aside className="h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:mt-12 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 font-semibold">Resumen</h3>
        <ul className="space-y-1 text-sm">
          {items.map((item) => (
            <li key={item.producto_id} className="flex justify-between">
              <span>
                {item.cantidad} × {item.nombre}
              </span>
              <span>{formatoPrecio(item.precio_unitario * item.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-lg font-bold dark:border-gray-700">
          <span>Total</span>
          <span>{formatoPrecio(total)}</span>
        </p>
      </aside>
    </main>
  );
}

export default CheckoutPage;
