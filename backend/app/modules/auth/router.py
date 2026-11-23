from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_SESION, get_current_active_user
from app.modules.auth.schema import Mensaje
from app.modules.auth.service import AuthService, CredencialesInvalidas, CuentaDesactivada, UsuarioDuplicado
from app.modules.usuarios.schema import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(datos: UserCreate, service: Annotated[AuthService, Depends(get_auth_service)]):
    try:
        return service.registrar(datos)
    except UsuarioDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/token", response_model=Mensaje)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: Annotated[AuthService, Depends(get_auth_service)],
):
    try:
        token = service.autenticar(form.username, form.password)
    except CredencialesInvalidas as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except CuentaDesactivada as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    response.set_cookie(
        key=COOKIE_SESION,
        value=token,
        httponly=True,  # JavaScript no puede leerla
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # en producción, con HTTPS: True
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje)
def logout(response: Response):
    response.delete_cookie(key=COOKIE_SESION, httponly=True, samesite="lax")
    return Mensaje(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: Annotated[UserPublic, Depends(get_current_active_user)]):
    return usuario