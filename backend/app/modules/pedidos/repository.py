from sqlmodel import select, col

from app.core.base_repository import BaseRepository
from app.core.fechas import ahora_utc
from app.modules.pedidos.model import DetallePedido, EstadoPedido, FormaPago, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    """Pedidos. Los borrados (deleted_at con fecha) quedan fuera de las consultas."""

    model = Pedido

    def get_activo(self, pedido_id: int) -> Pedido | None:
        pedido = self.get_by_id(pedido_id)
        if pedido is None or pedido.deleted_at is not None:
            return None
        return pedido

    def listar_activos(self, usuario_id: int | None = None) -> list[Pedido]:
        """Todos los pedidos, o solo los de un usuario si se indica usuario_id."""
        consulta = select(Pedido).where(col(Pedido.deleted_at).is_(None))
        if usuario_id is not None:
            consulta = consulta.where(Pedido.usuario_id == usuario_id)
        return list(self.session.exec(consulta.order_by(Pedido.id)).all())

    def borrado_logico(self, pedido: Pedido) -> None:
        self.update(pedido, {"deleted_at": ahora_utc()})


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    model = DetallePedido


class EstadoPedidoRepository(BaseRepository[EstadoPedido]):
    model = EstadoPedido

    def listar_en_orden(self) -> list[EstadoPedido]:
        return list(self.session.exec(select(EstadoPedido).order_by(EstadoPedido.orden)).all())


class FormaPagoRepository(BaseRepository[FormaPago]):
    model = FormaPago

    def listar_activas(self) -> list[FormaPago]:
        consulta = select(FormaPago).where(col(FormaPago.activo).is_(True)).order_by(FormaPago.codigo)
        return list(self.session.exec(consulta).all())
