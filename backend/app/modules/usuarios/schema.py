from typing import Annotated

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel

from app.core.tipos import TextoObligatorio


# ---------- Entrada ----------

class UserCreate(SQLModel):
    nombre: Annotated[TextoObligatorio, Field(max_length=80)]
    apellido: Annotated[TextoObligatorio, Field(max_length=80)]
    email: EmailStr
    celular: str | None = Field(default=None, max_length=20)
    password: str = Field(min_length=8, max_length=72)  # RN-09

    @field_validator("password")
    @classmethod
    def maximo_72_bytes(cls, password: str) -> str:
        # bcrypt solo usa los primeros 72 bytes; una "ñ" o una tilde ocupan 2
        if len(password.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return password


# ---------- Salida ----------

class UserPublic(SQLModel):
    """Datos del usuario que salen de la API: sin password_hash."""

    id: int
    nombre: str
    apellido: str
    email: str
    celular: str | None
    activo: bool
    roles: list[str]  # solo los vigentes (RN-14)


class RolPublic(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
