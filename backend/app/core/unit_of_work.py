from collections.abc import Callable

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Agrupa las operaciones de un caso de uso en UNA sola transacción.

    Uso en un service:

        with self.uow as uow:
            uow.pedidos.add(...)
            uow.detalles.add(...)

    Al salir del bloque with:
      - si no hubo errores  -> commit()  (se guarda todo)
      - si hubo una excepción -> rollback() (no se guarda nada)

    Cada módulo hereda de esta clase y crea, en _crear_repositorios(),
    los repositorios que sus casos de uso necesitan.
    """

    def __init__(self, session_factory: Callable[[], Session] = default_session_factory):
        self.session_factory = session_factory

    def __enter__(self):
        self.session = self.session_factory()
        self._crear_repositorios()
        return self

    def _crear_repositorios(self) -> None:
        """Lo sobrescribe el Unit of Work de cada módulo."""

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
        # False: si hubo una excepción, se vuelve a lanzar para que el Router la traduzca a HTTP.
        return False
