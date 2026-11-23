from fastapi import HTTPException
from sqlmodel import Session, col, select

from app.core.fechas import ahora_utc
from app.modules.categorias.model import Categoria
from app.modules.categorias.schema import CategoriaCreate, CategoriaUpdate


def _validar_nombre_libre(session: Session, nombre: str, excepto_id: int | None = None) -> None:
    """RN-02: el nombre es único. Una categoría borrada lo sigue ocupando (UQ en la tabla)."""
    otra = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
    if otra is not None and otra.id != excepto_id:
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese nombre")


def listar_categorias(session: Session) -> list[Categoria]:
    consulta = select(Categoria).where(col(Categoria.deleted_at).is_(None)).order_by(Categoria.id)
    return list(session.exec(consulta).all())


def obtener_categoria(session: Session, categoria_id: int) -> Categoria:
    categoria = session.get(Categoria, categoria_id)
    if categoria is None or categoria.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria


def crear_categoria(session: Session, datos: CategoriaCreate) -> Categoria:
    _validar_nombre_libre(session, datos.nombre)
    categoria = Categoria.model_validate(datos)
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return categoria


def actualizar_categoria(session: Session, categoria_id: int, datos: CategoriaUpdate) -> Categoria:
    categoria = obtener_categoria(session, categoria_id)
    # Un campo en null significa "no cambiar": la columna no admite nulos
    cambios = datos.model_dump(exclude_unset=True, exclude_none=True)
    if "nombre" in cambios:
        _validar_nombre_libre(session, cambios["nombre"], excepto_id=categoria_id)
    categoria.sqlmodel_update(cambios)
    session.add(categoria)
    session.commit()
    session.refresh(categoria)
    return categoria


def eliminar_categoria(session: Session, categoria_id: int) -> None:
    """Borrado lógico (RN-11): la fila queda en la base con deleted_at."""
    categoria = obtener_categoria(session, categoria_id)
    categoria.deleted_at = ahora_utc()
    session.add(categoria)
    session.commit()
