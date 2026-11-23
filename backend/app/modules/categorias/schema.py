from sqlmodel import SQLModel, Field
from app.core.tipos import TextoObligatorio


class CategoriaBase(SQLModel):
    nombre: TextoObligatorio
    descripcion: str = Field(default="", max_length=255)


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(SQLModel):
    nombre: TextoObligatorio | None = None
    descripcion: str | None = Field(default=None, max_length=255)


class CategoriaRead(CategoriaBase):
    id: int