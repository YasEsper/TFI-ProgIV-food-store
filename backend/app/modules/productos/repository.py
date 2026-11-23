from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.model import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def get_activo(self, producto_id: int) -> Producto | None:
        """El producto solo si está activo: uno dado de baja se trata como inexistente."""
        producto = self.get_by_id(producto_id)
        return producto if producto is not None and producto.activo else None

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        """Productos activos que cumplen los filtros: devuelve el total y la página pedida."""
        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        pagina = self.session.exec(
            select(Producto).where(*filtros).order_by(Producto.id).offset(skip).limit(limit)
        ).all()
        return total, list(pagina)
