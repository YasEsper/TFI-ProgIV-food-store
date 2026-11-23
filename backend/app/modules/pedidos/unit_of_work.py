from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import (
    DetallePedidoRepository,
    EstadoPedidoRepository,
    FormaPagoRepository,
    PedidoRepository,
)
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    def _crear_repositorios(self) -> None:
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetallePedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        self.estados = EstadoPedidoRepository(self.session)
        self.formas_pago = FormaPagoRepository(self.session)
