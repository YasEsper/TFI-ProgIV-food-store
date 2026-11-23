from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.model import Usuario, UsuarioRol
from app.modules.usuarios.schema import UserCreate, UserPublic
from app.modules.usuarios.service import a_public
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ROL_POR_DEFECTO = "user"


class EmailYaRegistrado(Exception):
    def __init__(self):
        super().__init__("El email ya está registrado")


class CredencialesInvalidas(Exception):
    def __init__(self):
        super().__init__("Email o contraseña incorrectos")


class CuentaDesactivada(Exception):
    def __init__(self):
        super().__init__("Cuenta de usuario desactivada")


class AuthService:
    """Registro, login y perfil. Usa el modelo y los repositorios del módulo usuarios."""

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_email(datos.email) is not None:
                raise EmailYaRegistrado()  # RN-02
            rol = uow.roles.get_by_nombre(ROL_POR_DEFECTO)
            if rol is None:
                raise RuntimeError(f"Falta el rol '{ROL_POR_DEFECTO}': correr seed.py")
            usuario = uow.usuarios.create(Usuario(
                **datos.model_dump(exclude={"password"}),
                password_hash=hash_password(datos.password),  # RN-01
            ))
            # asignado_por_id queda en None: el rol lo asigna el registro (RN-08)
            uow.usuarios_roles.create(UsuarioRol(usuario_id=usuario.id, rol_id=rol.id))
            return a_public(uow, usuario)

    def autenticar(self, email: str, password: str) -> str:
        """Devuelve el JWT si las credenciales son correctas."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_email(email)
            if usuario is None or not verify_password(password, usuario.password_hash):
                raise CredencialesInvalidas()  # mismo mensaje: no revela cuál falló
            if usuario.deleted_at is not None:
                raise CuentaDesactivada()
            return create_access_token(usuario.email)

    def perfil(self, email: str) -> UserPublic | None:
        """Usuario dueño del token, o None si ya no existe."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_email(email)
            return None if usuario is None else a_public(uow, usuario)