from datetime import datetime

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlmodel import Field, Relationship, SQLModel

from app.core.fechas import ahora_utc
from app.modules.categorias.model import Categoria


class ProductoCategoria(SQLModel, table=True):
    """Vínculo producto-categoría. Tiene datos propios (es_principal), por eso es una clase
    y no solo un link_model. Quitar una categoría borra esta fila, nunca la categoría."""

    __tablename__ = "producto_categoria"

    producto_id: int = Field(foreign_key="producto.id", primary_key=True, ondelete="CASCADE")
    categoria_id: int = Field(foreign_key="categoria.id", primary_key=True, ondelete="CASCADE")
    es_principal: bool = Field(default=False)
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))

    categoria: Categoria = Relationship()


class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, max_length=100)
    descripcion: str = Field(max_length=255)
    precio_base: float = Field(ge=0)
    imagenes_url: list[str] = Field(default_factory=list, sa_column=Column(ARRAY(String)))
    disponible: bool = Field(default=True)
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(
        default_factory=ahora_utc,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"onupdate": ahora_utc},
    )
    deleted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    vinculos: list[ProductoCategoria] = Relationship()