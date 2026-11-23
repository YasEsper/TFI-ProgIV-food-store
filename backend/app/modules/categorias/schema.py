from typing import Annotated

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

# Nombre de categoría: sin espacios en los extremos y de 2 a 100 caracteres
NombreCategoria = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria
    descripcion: str | None = Field(default=None, max_length=255)


class CategoriaUpdate(SQLModel):
    """Todos opcionales: se actualizan solo los campos enviados."""

    nombre: NombreCategoria | None = None
    descripcion: str | None = Field(default=None, max_length=255)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool