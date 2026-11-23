from sqlmodel import SQLModel, Session, create_engine

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea la sesión que usa el Unit of Work.

    expire_on_commit=False: después del commit los objetos conservan sus datos,
    así el service puede devolverlos sin volver a consultar la base.
    """
    return Session(engine, expire_on_commit=False)
