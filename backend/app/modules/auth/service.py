from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(Exception):
    def __init__(self, campo: str):
        super().__init__(f"El {campo} ya está registrado")


class CredencialesInvalidas(Exception):
    def __init__(self):
        super().__init__("Usuario o contraseña incorrectos")


class CuentaDesactivada(Exception):
    def __init__(self):
        super().__init__("Cuenta de usuario desactivada")


class AuthService:
    """Registro, login y perfil. Usa el modelo y el repositorio del módulo usuarios."""

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(datos.username) is not None:
                raise UsuarioDuplicado("username")
            if uow.usuarios.get_by_email(datos.email) is not None:
                raise UsuarioDuplicado("email")
            # role queda en "user" por el valor por defecto del modelo
            usuario = uow.usuarios.add(Usuario(
                **datos.model_dump(exclude={"password"}),
                hashed_password=hash_password(datos.password),
            ))
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> str:
        """Devuelve el JWT si las credenciales son correctas."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas()  # mismo mensaje: no revela cuál falló
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token(usuario.username)

    def perfil(self, username: str) -> UserPublic | None:
        """Usuario dueño del token, o None si ya no existe."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            return None if usuario is None else UserPublic.model_validate(usuario)