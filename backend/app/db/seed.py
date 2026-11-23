"""Carga inicial de datos. Es idempotente: se puede correr varias veces sin duplicar filas.

Uso, desde la carpeta backend con el .venv activado:
    python -m app.db.seed
"""

from sqlmodel import Session, select

import app.main  # noqa: F401  (registra todos los modelos para create_all)
from app.core.database import create_db_and_tables, engine
from app.core.security import hash_password
from app.modules.categorias.model import Categoria
from app.modules.productos.model import Producto
from app.modules.usuarios.model import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
}
ADMIN_PASSWORD = "Admin1234!"  # solo para desarrollo; figura en el README

CATEGORIAS = [
    {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra"},
    {"nombre": "Hamburguesas", "descripcion": "Con papas fritas"},
    {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y jugos"},
]

# Cada producto indica el nombre de su categoría; el id se resuelve al cargarlo
PRODUCTOS = [
    {"categoria": "Pizzas", "nombre": "Pizza muzzarella", "precio_base": 9500, "stock": 20},
    {"categoria": "Pizzas", "nombre": "Pizza napolitana", "precio_base": 10500, "stock": 15},
    {"categoria": "Pizzas", "nombre": "Pizza fugazzeta", "precio_base": 11000, "stock": 10},
    {"categoria": "Hamburguesas", "nombre": "Hamburguesa clásica", "precio_base": 8500, "stock": 25},
    {"categoria": "Hamburguesas", "nombre": "Hamburguesa doble cheddar", "precio_base": 11500, "stock": 12},
    {"categoria": "Hamburguesas", "nombre": "Hamburguesa veggie", "precio_base": 9000, "stock": 8},
    {"categoria": "Bebidas", "nombre": "Gaseosa 500 ml", "precio_base": 2000, "stock": 50},
    {"categoria": "Bebidas", "nombre": "Agua mineral 500 ml", "precio_base": 1500, "stock": 40},
]


def cargar_admin(session: Session) -> None:
    existe = session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first()
    if existe is not None:
        return
    session.add(Usuario(**ADMIN, hashed_password=hash_password(ADMIN_PASSWORD), role="admin"))


def cargar_categorias(session: Session) -> dict[str, Categoria]:
    categorias = {}
    for datos in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == datos["nombre"])).first()
        if categoria is None:
            categoria = Categoria(**datos)
            session.add(categoria)
        categorias[datos["nombre"]] = categoria
    session.flush()  # para que las categorías nuevas ya tengan id
    return categorias


def cargar_productos(session: Session, categorias: dict[str, Categoria]) -> None:
    for datos in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == datos["nombre"])).first() is not None:
            continue
        categoria = categorias[datos["categoria"]]
        session.add(Producto(categoria_id=categoria.id, **{k: v for k, v in datos.items() if k != "categoria"}))


def main() -> None:
    create_db_and_tables()
    with Session(engine) as session:
        cargar_admin(session)
        cargar_productos(session, cargar_categorias(session))
        session.commit()
    print("Seed completo: usuario admin, categorías y productos.")


if __name__ == "__main__":
    main()
