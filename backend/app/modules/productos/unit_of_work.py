from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    def _crear_repositorios(self) -> None:
        self.productos = ProductoRepository(self.session)
        # Para comprobar que la categoría de un producto existe y está activa
        self.categorias = CategoriaRepository(self.session)
