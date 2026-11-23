from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.schema import RolPublic, UserPublic
from app.modules.usuarios.service import UsuarioNoEncontrado, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

# Gestión de usuarios: todas las rutas son solo para admin.
# Cuelgan de /admin/usuarios, como pide la consigna.
router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Usuarios (admin)"],
    dependencies=[Depends(require_role(["admin"]))],
)

# Catálogo de roles: solo GET, para cualquier usuario autenticado (RN-06).
roles_router = APIRouter(
    prefix="/roles",
    tags=["Catálogos"],
    dependencies=[Depends(get_current_active_user)],
)


def get_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar(service: Annotated[UsuarioService, Depends(get_service)]):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar(usuario_id: int, service: Annotated[UsuarioService, Depends(get_service)]):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar(usuario_id: int, service: Annotated[UsuarioService, Depends(get_service)]):
    try:
        return service.desactivar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@roles_router.get("", response_model=list[RolPublic])
def listar_roles(service: Annotated[UsuarioService, Depends(get_service)]):
    return service.listar_roles()
