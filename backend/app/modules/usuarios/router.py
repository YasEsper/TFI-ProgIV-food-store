from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.schema import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

# Gestión de usuarios: todas las rutas son solo para admin.
# Cuelgan de /admin/usuarios, como pide la consigna.
router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Usuarios (admin)"],
    dependencies=[Depends(require_role(["admin"]))],
)


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar(service: Annotated[UsuarioService, Depends(get_usuario_service)]):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar(usuario_id: int, service: Annotated[UsuarioService, Depends(get_usuario_service)]):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar(
    usuario_id: int,
    admin: Annotated[UserPublic, Depends(get_current_active_user)],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
):
    try:
        return service.desactivar(usuario_id, admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AutoDesactivacion as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))