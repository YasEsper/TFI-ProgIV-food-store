from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.model import Producto
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"Producto {producto_id} no encontrado")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def _buscar(self, uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_activo(producto_id)
        if producto is None:
            raise ProductoNoEncontrado(producto_id)
        return producto

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        """La categoría tiene que existir y estar activa."""
        if uow.categorias.get_activa(categoria_id) is None:
            raise CategoriaNoEncontrada(categoria_id)

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in productos])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._buscar(uow, producto_id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, datos.categoria_id)
            producto = uow.productos.add(Producto.model_validate(datos))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar(uow, producto_id)
            # Solo los campos enviados; un null no borra columnas obligatorias
            cambios = datos.model_dump(exclude_unset=True, exclude_none=True)
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            return ProductoRead.model_validate(uow.productos.update(producto, cambios))

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.update(self._buscar(uow, producto_id), datos.model_dump())
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: el producto queda en la base, también para los pedidos que lo tienen."""
        with self.uow as uow:
            uow.productos.update(self._buscar(uow, producto_id), {"activo": False})
