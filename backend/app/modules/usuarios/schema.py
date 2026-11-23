from datetime import datetime
from typing import Annotated

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel

from app.core.tipos import TextoObligatorio


# ---------- Entrada ----------

class UserCreate(SQLModel):
    username: Annotated[TextoObligatorio, Field(max_length=50)]
    full_name: TextoObligatorio
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def maximo_72_bytes(cls, password: str) -> str:
        # bcrypt solo usa los primeros 72 bytes; una "ñ" o una tilde ocupan 2
        if len(password.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return password


# ---------- Salida ----------

class UserPublic(SQLModel):
    """Datos del usuario que salen de la API: nunca hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime