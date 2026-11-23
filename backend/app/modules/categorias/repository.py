from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.model import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca también entre las dadas de baja: la baja no libera el nombre."""
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def get_activa(self, categoria_id: int) -> Categoria | None:
        """La categoría solo si está activa: una dada de baja se trata como inexistente."""
        categoria = self.get_by_id(categoria_id)
        return categoria if categoria is not None and categoria.activo else None

    def listar_activas(self) -> list[Categoria]:
        consulta = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(Categoria.id)
        return list(self.session.exec(consulta).all())
