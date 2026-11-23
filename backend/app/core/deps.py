from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.modules.auth.service import AuthService
from app.modules.usuarios.schema import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_SESION = "access_token"


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Igual que OAuth2PasswordBearer, pero lee el token de la cookie HttpOnly
    y no del encabezado Authorization."""

    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get(COOKIE_SESION)
        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No autenticado",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserPublic:
    """Quién hace la petición: valida el token y busca al usuario en la base."""
    sin_sesion = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o sesión vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )
    username = decode_access_token(token)
    if username is None:
        raise sin_sesion
    usuario = AuthService(UsuarioUnitOfWork()).perfil(username)
    if usuario is None:
        raise sin_sesion
    return usuario


def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    """Además de tener sesión, la cuenta tiene que estar activa."""
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return usuario


def require_role(roles_permitidos: list[str]):
    """Fábrica de dependencias: deja pasar solo si el rol del usuario está permitido."""

    def verificar_rol(
        usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if usuario.role not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permisos insuficientes. Se requiere uno de: {roles_permitidos}",
            )
        return usuario

    return verificar_rol


# Atajo para las rutas de escritura del catálogo: dependencies=[solo_admin]
solo_admin = Depends(require_role(["admin"]))