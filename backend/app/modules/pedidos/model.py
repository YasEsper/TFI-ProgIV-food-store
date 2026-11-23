from datetime import datetime

from sqlalchemy import DateTime
from sqlmodel import SQLModel, Field, Relationship

from app.core.fechas import ahora_utc


class EstadoPedido(SQLModel, table=True):
    """Catálogo de estados del pedido. Solo lectura: lo carga seed.py."""

    __tablename__ = "estado_pedido"

    codigo: str = Field(primary_key=True, max_length=20)
    descripcion: str = Field(max_length=80)
    orden: int
    es_terminal: bool


class FormaPago(SQLModel, table=True):
    """Catálogo de formas de pago. Solo lectura: lo carga seed.py."""

    __tablename__ = "forma_pago"

    codigo: str = Field(primary_key=True, max_length=30)
    descripcion: str = Field(max_length=80)
    activo: bool = Field(default=True)


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"

    # PK compuesta: un mismo producto aparece una sola vez por pedido
    pedido_id: int = Field(foreign_key="pedido.id", primary_key=True, ondelete="CASCADE")
    producto_id: int = Field(foreign_key="producto.id", primary_key=True, ondelete="RESTRICT")
    cantidad: int
    precio_unitario: float


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")  # dueño: se toma de la sesión (RN-05)
    estado_codigo: str = Field(default="PENDIENTE", foreign_key="estado_pedido.codigo", max_length=20)
    forma_pago_codigo: str = Field(foreign_key="forma_pago.codigo", max_length=30)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(
        default_factory=ahora_utc,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"onupdate": ahora_utc},
    )
    deleted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    detalles: list[DetallePedido] = Relationship()