from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import solo_admin
from app.modules.categorias.schema import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

# Leer: público. Escribir: solo admin.
router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


Service = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar(service: Service):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener(categoria_id: int, service: Service):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=[solo_admin])
def crear(datos: CategoriaCreate, service: Service):
    try:
        return service.crear(datos)
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=[solo_admin])
def actualizar(categoria_id: int, datos: CategoriaUpdate, service: Service):
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[solo_admin])
def eliminar(categoria_id: int, service: Service) -> None:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
