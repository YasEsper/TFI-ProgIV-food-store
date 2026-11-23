"""Carga inicial de datos. Es idempotente: se puede correr varias veces sin duplicar filas.

Uso, desde la carpeta backend con el .venv activado:
    python -m app.db.seed
"""

from sqlmodel import Session, select

import app.main  # noqa: F401  (registra todos los modelos para create_all)
from app.core.database import create_db_and_tables, engine
from app.core.security import hash_password
from app.modules.usuarios.model import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
}
ADMIN_PASSWORD = "Admin1234!"  # solo para desarrollo; figura en el README


def cargar_admin(session: Session) -> None:
    existe = session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first()
    if existe is not None:
        return
    session.add(Usuario(**ADMIN, hashed_password=hash_password(ADMIN_PASSWORD), role="admin"))


def main() -> None:
    create_db_and_tables()
    with Session(engine) as session:
        cargar_admin(session)
        session.commit()
    print("Seed completo: usuario admin.")


if __name__ == "__main__":
    main()