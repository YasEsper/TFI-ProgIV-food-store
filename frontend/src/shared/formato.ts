const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

// Precio en pesos argentinos, por ejemplo $ 9.500,00
export const formatoPrecio = (valor: number) => pesos.format(valor);

const fechaHora = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

// La API manda la fecha en UTC; se muestra en hora de Argentina, por ejemplo 24/11/26, 21:30
export const formatoFecha = (iso: string) => fechaHora.format(new Date(iso));
