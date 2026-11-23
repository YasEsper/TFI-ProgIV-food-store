from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.fechas import ahora_utc
from app.modules.productos.model import Producto

if TYPE_CHECKING:
    from app.modules.usuarios.model import Usuario


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="PENDIENTE", max_length=20)
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None, max_length=500)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(
        default_factory=ahora_utc,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"onupdate": ahora_utc},
    )

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={"order_by": "DetallePedido.id"},
    )


class DetallePedido(SQLModel, table=True):
    """Línea del pedido. Copia el nombre y el precio del producto: no cambia aunque el producto cambie."""

    __tablename__ = "detalle_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    nombre_producto: str = Field(max_length=100)
    precio_unitario: float
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: Producto = Relationship(back_populates="detalles")
