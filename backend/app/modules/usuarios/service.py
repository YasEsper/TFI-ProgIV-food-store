from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int):
        super().__init__(f"Usuario {usuario_id} no encontrado")


class AutoDesactivacion(Exception):
    def __init__(self):
        super().__init__("El administrador no puede desactivarse a sí mismo")


class UsuarioService:
    """Gestión de usuarios por el admin: listado, activación y desactivación."""

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def _buscar(self, uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado(usuario_id)
        return usuario

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.listar()]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.update(self._buscar(uow, usuario_id), {"disabled": False})
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        if usuario_id == admin_id:
            raise AutoDesactivacion()
        with self.uow as uow:
            usuario = uow.usuarios.update(self._buscar(uow, usuario_id), {"disabled": True})
            return UserPublic.model_validate(usuario)
