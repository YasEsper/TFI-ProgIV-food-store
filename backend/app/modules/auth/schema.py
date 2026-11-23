from sqlmodel import SQLModel


class Mensaje(SQLModel):
    """Respuesta simple para login y logout: el token va en la cookie, no en el cuerpo."""

    mensaje: str