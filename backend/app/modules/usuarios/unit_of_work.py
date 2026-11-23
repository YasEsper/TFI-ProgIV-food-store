from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import RolRepository, UsuarioRepository, UsuarioRolRepository


class UsuarioUnitOfWork(UnitOfWork):
    def _crear_repositorios(self) -> None:
        self.usuarios = UsuarioRepository(self.session)
        self.roles = RolRepository(self.session)
        self.usuarios_roles = UsuarioRolRepository(self.session)
    