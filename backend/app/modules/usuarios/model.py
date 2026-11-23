from datetime import datetime

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.fechas import ahora_utc


class Rol(SQLModel, table=True):
    """Catálogo de roles (admin, user). Se carga con seed.py."""

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, max_length=50)
    descripcion: str | None = Field(default=None)


class UsuarioRol(SQLModel, table=True):
    """Asignación de un rol a un usuario. Sin expires_at, no vence."""

    __tablename__ = "usuario_rol"

    usuario_id: int = Field(foreign_key="usuario.id", primary_key=True)
    rol_id: int = Field(foreign_key="rol.id", primary_key=True)
    asignado_por_id: int | None = Field(default=None, foreign_key="usuario.id")
    expires_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))

    rol: Rol = Relationship()


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=80)
    apellido: str = Field(max_length=80)
    email: str = Field(unique=True, max_length=254)
    celular: str | None = Field(default=None, max_length=20)
    password_hash: str = Field(max_length=60)
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(
        default_factory=ahora_utc,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"onupdate": ahora_utc},
    )
    deleted_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))

    # UsuarioRol tiene dos FK a usuario (usuario_id y asignado_por_id):
    # hay que decirle cuál une la asignación con su dueño.
    roles_asignados: list[UsuarioRol] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "[UsuarioRol.usuario_id]"}
    )