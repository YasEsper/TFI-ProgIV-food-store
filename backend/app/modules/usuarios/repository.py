from sqlmodel import select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.model import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.username == username)).first()

    def get_by_email(self, email: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.email == email)).first()

    def listar(self) -> list[Usuario]:
        """Todos, también los desactivados: el admin necesita verlos para reactivarlos."""
        return list(self.session.exec(select(Usuario).order_by(Usuario.id)).all())