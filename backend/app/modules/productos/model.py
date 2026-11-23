from sqlmodel import Field, Relationship, SQLModel

from app.modules.categorias.model import Categoria


class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id")
    nombre: str = Field(index=True, max_length=100)
    descripcion: str | None = Field(default=None, max_length=255)
    precio_base: float
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    categoria: Categoria = Relationship(back_populates="productos")
