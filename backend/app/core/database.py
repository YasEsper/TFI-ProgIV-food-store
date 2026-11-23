from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    """Sesión por request, usada por los módulos del TP 7 (categoria y producto)."""
    with Session(engine) as session:
        yield session


def session_factory() -> Session:
    """Crea la sesión que usa el Unit of Work.

    expire_on_commit=False: después del commit los objetos conservan sus datos,
    así el service puede devolverlos sin volver a consultar la base.
    """
    return Session(engine, expire_on_commit=False)
