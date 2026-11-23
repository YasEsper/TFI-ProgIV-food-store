from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.fechas import ahora_utc
from app.modules.categorias.service import obtener_categoria
from app.modules.productos.model import Producto, ProductoCategoria
from app.modules.productos.schema import (
    CategoriaDeProducto,
    ProductoCategoriaCreate,
    ProductoCreate,
    ProductoReadFull,
    ProductoUpdate,
)

# Trae cada producto con sus vínculos y la categoría de cada vínculo en dos consultas
CON_CATEGORIAS = selectinload(Producto.vinculos).selectinload(ProductoCategoria.categoria)


def _categorias_de(producto: Producto) -> list[CategoriaDeProducto]:
    """Categorías vigentes del producto, la principal primero."""
    categorias = [
        CategoriaDeProducto(id=v.categoria.id, nombre=v.categoria.nombre, es_principal=v.es_principal)
        for v in producto.vinculos
        if v.categoria.deleted_at is None
    ]
    return sorted(categorias, key=lambda c: (not c.es_principal, c.nombre))


def _a_read_full(producto: Producto) -> ProductoReadFull:
    return ProductoReadFull.model_validate(producto, update={"categorias": _categorias_de(producto)})


def _buscar(session: Session, producto_id: int) -> Producto:
    consulta = select(Producto).where(Producto.id == producto_id).options(CON_CATEGORIAS)
    producto = session.exec(consulta).first()
    if producto is None or producto.deleted_at is not None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


def listar_productos(session: Session) -> list[ProductoReadFull]:
    consulta = (
        select(Producto)
        .where(col(Producto.deleted_at).is_(None))
        .order_by(Producto.id)
        .options(CON_CATEGORIAS)
    )
    return [_a_read_full(p) for p in session.exec(consulta).all()]


def obtener_producto(session: Session, producto_id: int) -> ProductoReadFull:
    return _a_read_full(_buscar(session, producto_id))


def crear_producto(session: Session, datos: ProductoCreate) -> Producto:
    producto = Producto.model_validate(datos)
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto


def actualizar_producto(session: Session, producto_id: int, datos: ProductoUpdate) -> Producto:
    producto = _buscar(session, producto_id)
    # Un campo en null significa "no cambiar": las columnas no admiten nulos
    cambios = datos.model_dump(exclude_unset=True, exclude_none=True)
    producto.sqlmodel_update(cambios)
    session.add(producto)
    session.commit()
    session.refresh(producto)
    return producto


def eliminar_producto(session: Session, producto_id: int) -> None:
    """Borrado lógico (RN-11): el producto queda en la base, también para los pedidos que lo tienen."""
    producto = _buscar(session, producto_id)
    producto.deleted_at = ahora_utc()
    session.add(producto)
    session.commit()


def listar_categorias_de_producto(session: Session, producto_id: int) -> list[CategoriaDeProducto]:
    return _categorias_de(_buscar(session, producto_id))


def asociar_categoria(session: Session, producto_id: int, datos: ProductoCategoriaCreate) -> ProductoReadFull:
    producto = _buscar(session, producto_id)
    obtener_categoria(session, datos.categoria_id)  # 404 si no existe o está borrada
    if session.get(ProductoCategoria, (producto_id, datos.categoria_id)):
        raise HTTPException(status_code=409, detail="El producto ya tiene esa categoría")
    if datos.es_principal:
        # Una sola principal por producto: la anterior deja de serlo
        for vinculo in producto.vinculos:
            vinculo.es_principal = False
    session.add(ProductoCategoria(producto_id=producto_id, **datos.model_dump()))
    session.commit()
    session.expire_all()  # para releer los vínculos con el nuevo incluido
    return obtener_producto(session, producto_id)


def desasociar_categoria(session: Session, producto_id: int, categoria_id: int) -> None:
    """Borra la fila de enlace (RN-11): el producto y la categoría no se tocan."""
    _buscar(session, producto_id)
    vinculo = session.get(ProductoCategoria, (producto_id, categoria_id))
    if not vinculo:
        raise HTTPException(status_code=404, detail="El producto no tiene esa categoría")
    session.delete(vinculo)
    session.commit()