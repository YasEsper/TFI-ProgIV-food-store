const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

// Precio en pesos argentinos, por ejemplo $ 9.500,00
export const formatoPrecio = (valor: number) => pesos.format(valor);
