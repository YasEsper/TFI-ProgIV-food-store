"""Carga inicial de datos. Es idempotente: se puede correr varias veces sin duplicar filas.

Uso, desde la carpeta backend con el .venv activado:
    python -m app.db.seed
"""

from sqlmodel import Session, select

import app.main  # noqa: F401  (registra todos los modelos para create_all)
from app.core.database import create_db_and_tables, engine
from app.core.security import hash_password
from app.modules.pedidos.model import EstadoPedido, FormaPago
from app.modules.usuarios.model import Rol, Usuario, UsuarioRol

ROLES = {
    "admin": "Administrador: gestiona el catálogo y los usuarios",
    "user": "Cliente: consulta el catálogo y hace pedidos",
}

# Los seis estados del diagrama UML_FOOD_STORE, en orden
ESTADOS_PEDIDO = [
    {"codigo": "PENDIENTE", "descripcion": "Pedido recibido", "orden": 1, "es_terminal": False},
    {"codigo": "CONFIRMADO", "descripcion": "Pedido confirmado", "orden": 2, "es_terminal": False},
    {"codigo": "EN_PREP", "descripcion": "En preparación", "orden": 3, "es_terminal": False},
    {"codigo": "EN_CAMINO", "descripcion": "En camino", "orden": 4, "es_terminal": False},
    {"codigo": "ENTREGADO", "descripcion": "Entregado", "orden": 5, "es_terminal": True},
    {"codigo": "CANCELADO", "descripcion": "Cancelado", "orden": 6, "es_terminal": True},
]

FORMAS_PAGO = [
    {"codigo": "EFECTIVO", "descripcion": "Efectivo"},
    {"codigo": "TRANSFERENCIA", "descripcion": "Transferencia bancaria"},
]

ADMIN_EMAIL = "admin@foodstore.com"
ADMIN_PASSWORD = "Admin1234!"  # solo para desarrollo; figura en el README


def cargar_roles(session: Session) -> dict[str, Rol]:
    roles = {}
    for nombre, descripcion in ROLES.items():
        rol = session.exec(select(Rol).where(Rol.nombre == nombre)).first()
        if rol is None:
            rol = Rol(nombre=nombre, descripcion=descripcion)
            session.add(rol)
        roles[nombre] = rol
    session.flush()  # para que los roles nuevos ya tengan id
    return roles


def cargar_catalogo(session: Session, modelo: type[EstadoPedido | FormaPago], filas: list[dict]) -> None:
    """Inserta solo las filas cuyo código todavía no está en la tabla."""
    for fila in filas:
        if session.get(modelo, fila["codigo"]) is None:
            session.add(modelo(**fila))


def cargar_admin(session: Session, rol_admin: Rol) -> None:
    if session.exec(select(Usuario).where(Usuario.email == ADMIN_EMAIL)).first() is not None:
        return
    admin = Usuario(
        nombre="Admin",
        apellido="Food Store",
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
    )
    session.add(admin)
    session.flush()
    session.add(UsuarioRol(usuario_id=admin.id, rol_id=rol_admin.id))


def main() -> None:
    create_db_and_tables()
    with Session(engine) as session:
        roles = cargar_roles(session)
        cargar_catalogo(session, EstadoPedido, ESTADOS_PEDIDO)
        cargar_catalogo(session, FormaPago, FORMAS_PAGO)
        cargar_admin(session, roles["admin"])
        session.commit()
    print("Seed completo: roles, estados de pedido, formas de pago y usuario admin.")


if __name__ == "__main__":
    main()