from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.fechas import ahora_utc

if TYPE_CHECKING:
    from app.modules.pedidos.model import Pedido


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, max_length=50)
    full_name: str = Field(max_length=100)
    email: str = Field(unique=True, max_length=254)
    hashed_password: str = Field(max_length=60)
    role: str = Field(default="user", max_length=10)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
