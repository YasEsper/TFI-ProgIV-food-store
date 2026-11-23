from datetime import datetime

from pydantic import field_validator
from sqlmodel import SQLModel, Field


# ---------- Entrada ----------

class DetallePedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """Sin usuario_id: el dueño del pedido sale de la sesión, nunca del cuerpo (RN-05)."""

    forma_pago_codigo: str
    detalles: list[DetallePedidoCreate] = Field(min_length=1)  # al menos un detalle

    @field_validator("detalles")
    @classmethod
    def sin_productos_repetidos(cls, detalles: list[DetallePedidoCreate]) -> list[DetallePedidoCreate]:
        ids = [d.producto_id for d in detalles]
        if len(ids) != len(set(ids)):
            raise ValueError("Un mismo producto no puede repetirse en el pedido")
        return detalles


class PedidoUpdate(SQLModel):
    estado_codigo: str  # tiene que existir en el catálogo estado_pedido


# ---------- Salida ----------

class DetallePedidoRead(SQLModel):
    producto_id: int
    cantidad: int
    precio_unitario: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado_codigo: str
    forma_pago_codigo: str
    total: float
    created_at: datetime


class PedidoReadFull(PedidoRead):
    detalles: list[DetallePedidoRead]


# ---------- Catálogos (solo lectura) ----------

class EstadoPedidoRead(SQLModel):
    codigo: str
    descripcion: str
    orden: int
    es_terminal: bool


class FormaPagoRead(SQLModel):
    codigo: str
    descripcion: str