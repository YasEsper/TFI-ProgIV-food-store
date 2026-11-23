from sqlmodel import col, or_, select

from app.core.base_repository import BaseRepository
from app.core.fechas import ahora_utc
from app.modules.usuarios.model import Rol, Usuario, UsuarioRol


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_email(self, email: str) -> Usuario | None:
        return self.session.exec(select(Usuario).where(Usuario.email == email)).first()

    def listar(self) -> list[Usuario]:
        """Todos, también los desactivados: el admin necesita verlos para reactivarlos."""
        return list(self.session.exec(select(Usuario).order_by(Usuario.id)).all())

    def roles_vigentes(self, usuario_id: int) -> list[str]:
        """Nombres de los roles sin vencimiento o que todavía no vencieron (RN-14)."""
        consulta = (
            select(Rol.nombre)
            .join(UsuarioRol, col(UsuarioRol.rol_id) == Rol.id)
            .where(UsuarioRol.usuario_id == usuario_id)
            .where(or_(col(UsuarioRol.expires_at).is_(None), col(UsuarioRol.expires_at) > ahora_utc()))
            .order_by(Rol.nombre)
        )
        return list(self.session.exec(consulta).all())


class RolRepository(BaseRepository[Rol]):
    model = Rol

    def get_by_nombre(self, nombre: str) -> Rol | None:
        return self.session.exec(select(Rol).where(Rol.nombre == nombre)).first()


class UsuarioRolRepository(BaseRepository[UsuarioRol]):
    model = UsuarioRol
