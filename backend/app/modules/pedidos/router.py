from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, solo_admin
from app.modules.pedidos.schema import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoCancelable,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schema import UserPublic

# Todas las rutas de pedidos piden sesión.
router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


Service = Annotated[PedidoService, Depends(get_pedido_service)]
UsuarioActual = Annotated[UserPublic, Depends(get_current_active_user)]


def error(codigo: int, e: Exception) -> HTTPException:
    return HTTPException(status_code=codigo, detail=str(e))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear(datos: PedidoCreate, usuario: UsuarioActual, service: Service):
    try:
        return service.crear(datos, usuario.id)
    except ProductoNoEncontrado as e:
        raise error(status.HTTP_404_NOT_FOUND, e)
    except (ProductoRepetido, ProductoNoDisponible, StockInsuficiente) as e:
        raise error(status.HTTP_400_BAD_REQUEST, e)


@router.get("", response_model=PedidosPaginados)
def listar(
    usuario: UsuarioActual,
    service: Service,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(usuario, estado, skip, limit)


# Se declara antes de /{pedido_id}: si no, "resumen" se tomaría como un id
@router.get("/resumen", response_model=ResumenPedidos, dependencies=[solo_admin])
def resumen(service: Service):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener(pedido_id: int, usuario: UsuarioActual, service: Service):
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise error(status.HTTP_404_NOT_FOUND, e)
    except PedidoAjeno as e:
        raise error(status.HTTP_403_FORBIDDEN, e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=[solo_admin])
def cambiar_estado(pedido_id: int, datos: CambioEstado, service: Service):
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except PedidoNoEncontrado as e:
        raise error(status.HTTP_404_NOT_FOUND, e)
    except TransicionInvalida as e:
        raise error(status.HTTP_400_BAD_REQUEST, e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar(pedido_id: int, usuario: UsuarioActual, service: Service):
    try:
        return service.cancelar(pedido_id, usuario)
    except PedidoNoEncontrado as e:
        raise error(status.HTTP_404_NOT_FOUND, e)
    except PedidoAjeno as e:
        raise error(status.HTTP_403_FORBIDDEN, e)
    except PedidoNoCancelable as e:
        raise error(status.HTTP_400_BAD_REQUEST, e)
