from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_active_user, solo_admin
from app.modules.productos import service
from app.modules.productos.schema import (
    CategoriaDeProducto,
    ProductoCategoriaCreate,
    ProductoCreate,
    ProductoRead,
    ProductoReadFull,
    ProductoUpdate,
)

# Leer: cualquier usuario autenticado (RN-07). Escribir: solo admin (RN-04),
# incluida la asignación de categorías (ProductoCategoria).
router = APIRouter(
    prefix="/productos",
    tags=["Productos"],
    dependencies=[Depends(get_current_active_user)],
)


@router.get("/", response_model=list[ProductoReadFull])
def listar(session: Session = Depends(get_session)):
    return service.listar_productos(session)


@router.get("/{producto_id}", response_model=ProductoReadFull)
def obtener(producto_id: int, session: Session = Depends(get_session)):
    return service.obtener_producto(session, producto_id)


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=[solo_admin])
def crear(datos: ProductoCreate, session: Session = Depends(get_session)):
    return service.crear_producto(session, datos)


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=[solo_admin])
def actualizar(producto_id: int, datos: ProductoUpdate, session: Session = Depends(get_session)):
    return service.actualizar_producto(session, producto_id, datos)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[solo_admin])
def eliminar(producto_id: int, session: Session = Depends(get_session)):
    service.eliminar_producto(session, producto_id)


@router.get("/{producto_id}/categorias", response_model=list[CategoriaDeProducto])
def listar_categorias(producto_id: int, session: Session = Depends(get_session)):
    return service.listar_categorias_de_producto(session, producto_id)


@router.post(
    "/{producto_id}/categorias",
    response_model=ProductoReadFull,
    status_code=status.HTTP_201_CREATED,
    dependencies=[solo_admin],
)
def asociar_categoria(producto_id: int, datos: ProductoCategoriaCreate, session: Session = Depends(get_session)):
    return service.asociar_categoria(session, producto_id, datos)


@router.delete(
    "/{producto_id}/categorias/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[solo_admin],
)
def desasociar_categoria(producto_id: int, categoria_id: int, session: Session = Depends(get_session)):
    service.desasociar_categoria(session, producto_id, categoria_id)