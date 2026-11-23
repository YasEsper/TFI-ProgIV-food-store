from datetime import datetime

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.model import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self,
        usuario_id: int | None,
        estado: str | None,
        skip: int,
        limit: int,
    ) -> tuple[int, list[Pedido]]:
        """Pedidos de un usuario (o de todos si usuario_id es None), del más nuevo al más viejo."""
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        pagina = self.session.exec(
            select(Pedido).where(*filtros).order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()
        return total, list(pagina)

    def count_by_estado(self) -> dict[str, int]:
        """Cantidad de pedidos por estado, por ejemplo {"PENDIENTE": 3, "ENTREGADO": 5}."""
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)).one()

    def suma_total_por_estado(self, estado: str) -> float:
        suma = self.session.exec(select(func.sum(Pedido.total)).where(Pedido.estado == estado)).one()
        return float(suma or 0)


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    model = DetallePedido
