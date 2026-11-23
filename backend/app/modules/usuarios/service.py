from app.core.fechas import ahora_utc
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import RolPublic, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int):
        super().__init__(f"Usuario {usuario_id} no encontrado")


def a_public(uow: UsuarioUnitOfWork, usuario: Usuario) -> UserPublic:
    """Arma la salida del usuario: sin password_hash, con su estado y sus roles vigentes."""
    return UserPublic.model_validate(
        usuario,
        update={
            "activo": usuario.deleted_at is None,
            "roles": uow.usuarios.roles_vigentes(usuario.id),
        },
    )


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
            return [a_public(uow, u) for u in uow.usuarios.listar()]

    def activar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.update(self._buscar(uow, usuario_id), {"deleted_at": None})
            return a_public(uow, usuario)

    def desactivar(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.update(self._buscar(uow, usuario_id), {"deleted_at": ahora_utc()})
            return a_public(uow, usuario)

    def listar_roles(self) -> list[RolPublic]:
        with self.uow as uow:
            return [RolPublic.model_validate(r) for r in uow.roles.get_all()]
