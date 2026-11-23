from typing import Annotated

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

from app.modules.categorias.schema import CategoriaRead

NombreProducto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


# ---------- Entrada ----------

class ProductoCreate(SQLModel):
    categoria_id: int
    nombre: NombreProducto
    descripcion: str | None = Field(default=None, max_length=255)
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(SQLModel):
    """Todos opcionales: se actualizan solo los campos enviados."""

    categoria_id: int | None = None
    nombre: NombreProducto | None = None
    descripcion: str | None = Field(default=None, max_length=255)
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


# ---------- Salida ----------

class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
