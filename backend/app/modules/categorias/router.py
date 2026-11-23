from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_active_user, solo_admin
from app.modules.categorias import service
from app.modules.categorias.schema import CategoriaCreate, CategoriaUpdate, CategoriaRead

# Leer: cualquier usuario autenticado (RN-07). Escribir: solo admin (RN-04).
router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"],
    dependencies=[Depends(get_current_active_user)],
)


@router.get("/", response_model=list[CategoriaRead])
def listar(session: Session = Depends(get_session)):
    return service.listar_categorias(session)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener(categoria_id: int, session: Session = Depends(get_session)):
    return service.obtener_categoria(session, categoria_id)


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=[solo_admin])
def crear(datos: CategoriaCreate, session: Session = Depends(get_session)):
    return service.crear_categoria(session, datos)


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=[solo_admin])
def actualizar(categoria_id: int, datos: CategoriaUpdate, session: Session = Depends(get_session)):
    return service.actualizar_categoria(session, categoria_id, datos)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[solo_admin])
def eliminar(categoria_id: int, session: Session = Depends(get_session)):
    service.eliminar_categoria(session, categoria_id)
