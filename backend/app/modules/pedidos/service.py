from app.modules.pedidos.model import DetallePedido, Pedido
from app.modules.pedidos.schema import (
    EstadoPedidoRead,
    FormaPagoRead,
    PedidoCreate,
    PedidoRead,
    PedidoReadFull,
    PedidoUpdate,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schema import UserPublic


class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"Producto {producto_id} no encontrado")


class CatalogoNoEncontrado(Exception):
    """Estado o forma de pago que no está (o no está activa) en su catálogo."""


class PedidoTerminado(Exception):
    def __init__(self, estado: str):
        super().__init__(f"El pedido está {estado} y ya no cambia de estado")


def _es_admin(usuario: UserPublic) -> bool:
    return "admin" in usuario.roles


class PedidoService:
    """Reglas de negocio de pedidos. Cada caso de uso corre dentro del Unit of Work."""

    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def _buscar(self, uow: PedidoUnitOfWork, pedido_id: int, usuario: UserPublic | None = None) -> Pedido:
        """Pedido activo. Si se pasa un usuario que no es admin, tiene que ser el dueño:
        a un pedido ajeno se responde igual que a uno inexistente (404)."""
        pedido = uow.pedidos.get_activo(pedido_id)
        if pedido is None or (usuario and not _es_admin(usuario) and pedido.usuario_id != usuario.id):
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    def listar(self, usuario: UserPublic) -> list[PedidoRead]:
        """El admin ve todos los pedidos; un user, solo los suyos."""
        with self.uow as uow:
            filtro = None if _es_admin(usuario) else usuario.id
            return [PedidoRead.model_validate(p) for p in uow.pedidos.listar_activos(filtro)]

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoReadFull:
        with self.uow as uow:
            return PedidoReadFull.model_validate(self._buscar(uow, pedido_id, usuario))

    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoReadFull:
        with self.uow as uow:
            forma_pago = uow.formas_pago.get_by_id(datos.forma_pago_codigo)
            if forma_pago is None or not forma_pago.activo:
                raise CatalogoNoEncontrado(f"Forma de pago {datos.forma_pago_codigo} no encontrada")
            pedido = uow.pedidos.create(Pedido(usuario_id=usuario_id, forma_pago_codigo=forma_pago.codigo))
            total = 0.0
            for item in datos.detalles:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or producto.deleted_at is not None:
                    raise ProductoNoEncontrado(item.producto_id)  # rollback: tampoco queda el pedido
                uow.detalles.create(DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    precio_unitario=producto.precio_base,
                ))
                total += item.cantidad * producto.precio_base
            pedido = uow.pedidos.update(pedido, {"total": round(total, 2)})
            return PedidoReadFull.model_validate(pedido)

    def actualizar_estado(self, pedido_id: int, datos: PedidoUpdate) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if uow.estados.get_by_id(pedido.estado_codigo).es_terminal:
                raise PedidoTerminado(pedido.estado_codigo)
            if uow.estados.get_by_id(datos.estado_codigo) is None:
                raise CatalogoNoEncontrado(f"Estado {datos.estado_codigo} no encontrado")
            pedido = uow.pedidos.update(pedido, {"estado_codigo": datos.estado_codigo})
            return PedidoRead.model_validate(pedido)

    def eliminar(self, pedido_id: int) -> None:
        with self.uow as uow:
            uow.pedidos.borrado_logico(self._buscar(uow, pedido_id))

    def listar_estados(self) -> list[EstadoPedidoRead]:
        with self.uow as uow:
            return [EstadoPedidoRead.model_validate(e) for e in uow.estados.listar_en_orden()]

    def listar_formas_pago(self) -> list[FormaPagoRead]:
        with self.uow as uow:
            return [FormaPagoRead.model_validate(f) for f in uow.formas_pago.listar_activas()]