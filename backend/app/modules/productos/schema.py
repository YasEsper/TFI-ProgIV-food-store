from sqlmodel import SQLModel, Field

from app.core.tipos import TextoObligatorio


class ProductoBase(SQLModel):
    nombre: TextoObligatorio
    descripcion: str = Field(max_length=255)
    precio_base: float = Field(ge=0)
    imagenes_url: list[str] = Field(default_factory=list)
    disponible: bool = True


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(SQLModel):
    nombre: TextoObligatorio | None = None
    descripcion: str | None = Field(default=None, max_length=255)
    precio_base: float | None = Field(default=None, ge=0)
    imagenes_url: list[str] | None = None
    disponible: bool | None = None


class ProductoRead(ProductoBase):
    id: int


class CategoriaDeProducto(SQLModel):
    """Categoría tal como se ve desde un producto: con su indicador es_principal."""

    id: int
    nombre: str
    es_principal: bool


class ProductoReadFull(ProductoRead):
    categorias: list[CategoriaDeProducto] = []


class ProductoCategoriaCreate(SQLModel):
    categoria_id: int
    es_principal: bool = False