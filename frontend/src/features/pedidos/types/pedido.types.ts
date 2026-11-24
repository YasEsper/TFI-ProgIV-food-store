// Mismos valores que los Literal del backend (pedidos/schema.py)
export type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

// Copia del producto al momento de comprar: no cambia si después se edita el producto
export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

// PedidoRead del backend
export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

// Respuesta de GET /pedidos
export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

export interface FiltrosPedidos {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}

// Formulario del checkout
export interface DatosEntrega {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

// Cuerpo de POST /pedidos (PedidoCreate). Sin usuario_id: el backend lo toma de la sesión.
export interface PedidoInput {
  items: { producto_id: number; cantidad: number }[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}
