from datetime import datetime

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel

from app.core.fechas import ahora_utc


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, max_length=50)
    full_name: str = Field(max_length=100)
    email: str = Field(unique=True, max_length=254)
    hashed_password: str = Field(max_length=60)
    role: str = Field(default="user", max_length=10)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))