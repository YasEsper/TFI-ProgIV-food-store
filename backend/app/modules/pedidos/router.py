from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_active_user, require_role, solo_admin
from app.modules.pedidos.schema import (
    EstadoPedidoRead,
    FormaPagoRead,
    PedidoCreate,
    PedidoRead,
    PedidoReadFull,
    PedidoUpdate,
)
from app.modules.pedidos.service import (
    CatalogoNoEncontrado,
    PedidoNoEncontrado,
    PedidoService,
    PedidoTerminado,
    ProductoNoEncontrado,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schema import UserPublic

# Todas las rutas de pedidos piden sesión. Crear: user o admin (RN-05).
# Cambiar el estado y borrar: solo admin.
router = APIRouter(prefix="/pedidos", tags=["pedidos"], dependencies=[Depends(get_current_active_user)])

# Catálogos de Ventas: solo GET, para cualquier usuario autenticado (RN-06).
# Al no tener POST, PUT ni DELETE, FastAPI responde 405 ante una escritura.
catalogos_router = APIRouter(tags=["Catálogos"], dependencies=[Depends(get_current_active_user)])

UsuarioActual = Annotated[UserPublic, Depends(get_current_active_user)]
Cliente = Annotated[UserPublic, Depends(require_role(["user", "admin"]))]


def get_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.get("/", response_model=list[PedidoRead])
def listar(usuario: UsuarioActual, service: PedidoService = Depends(get_service)):
    return service.listar(usuario)


@router.get("/{pedido_id}", response_model=PedidoReadFull)
def obtener(pedido_id: int, usuario: UsuarioActual, service: PedidoService = Depends(get_service)):
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/", response_model=PedidoReadFull, status_code=status.HTTP_201_CREATED)
def crear(datos: PedidoCreate, usuario: Cliente, service: PedidoService = Depends(get_service)):
    try:
        return service.crear(datos, usuario_id=usuario.id)
    except (ProductoNoEncontrado, CatalogoNoEncontrado) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{pedido_id}", response_model=PedidoRead, dependencies=[solo_admin])
def actualizar_estado(pedido_id: int, datos: PedidoUpdate, service: PedidoService = Depends(get_service)):
    try:
        return service.actualizar_estado(pedido_id, datos)
    except (PedidoNoEncontrado, CatalogoNoEncontrado) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PedidoTerminado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{pedido_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[solo_admin])
def eliminar(pedido_id: int, service: PedidoService = Depends(get_service)):
    try:
        service.eliminar(pedido_id)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@catalogos_router.get("/estados-pedido", response_model=list[EstadoPedidoRead])
def listar_estados(service: PedidoService = Depends(get_service)):
    return service.listar_estados()


@catalogos_router.get("/formas-pago", response_model=list[FormaPagoRead])
def listar_formas_pago(service: PedidoService = Depends(get_service)):
    return service.listar_formas_pago()