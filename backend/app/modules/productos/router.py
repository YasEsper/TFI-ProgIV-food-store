from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import solo_admin
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

# Leer: público. Escribir: solo admin.
router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


Service = Annotated[ProductoService, Depends(get_producto_service)]


def no_encontrado(e: Exception) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("", response_model=ProductosPaginados)
def listar(
    service: Service,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener(producto_id: int, service: Service):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise no_encontrado(e)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=[solo_admin])
def crear(datos: ProductoCreate, service: Service):
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as e:
        raise no_encontrado(e)


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=[solo_admin])
def actualizar(producto_id: int, datos: ProductoUpdate, service: Service):
    try:
        return service.actualizar(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise no_encontrado(e)


@router.patch("/{producto_id}/stock", response_model=ProductoRead, dependencies=[solo_admin])
def actualizar_stock(producto_id: int, datos: ProductoStockUpdate, service: Service):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as e:
        raise no_encontrado(e)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[solo_admin])
def eliminar(producto_id: int, service: Service) -> None:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise no_encontrado(e)
