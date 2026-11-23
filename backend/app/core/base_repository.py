from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    """CRUD genérico sobre una tabla.

    Regla de la arquitectura: el repositorio NUNCA llama a commit() ni a rollback().
    Solo usa flush(), que manda los cambios a la base dentro de la transacción
    abierta (por ejemplo, para que un objeto nuevo ya tenga su id) sin confirmarla.
    Confirmar o revertir es tarea del Unit of Work.
    """

    model: type[ModelT]

    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, id: int) -> ModelT | None:
        return self.session.get(self.model, id)

    def get_all(self) -> list[ModelT]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def update(self, obj: ModelT, cambios: dict) -> ModelT:
        obj.sqlmodel_update(cambios)
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: ModelT) -> None:
        self.session.delete(obj)
        self.session.flush()