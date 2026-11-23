from app.core.fechas import inicio_de_hoy_utc
from app.modules.pedidos.model import DetallePedido, Pedido
from app.modules.pedidos.schema import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schema import UserPublic

# Máquina de estados (RN-02): a qué estados se puede pasar desde cada uno.
# ENTREGADO y CANCELADO son terminales: no admiten cambios.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


# ---------- Excepciones de dominio (el router las traduce a HTTP) ----------

class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"Pedido {pedido_id} no encontrado")


class PedidoAjeno(Exception):
    def __init__(self):
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(Exception):
    def __init__(self):
        super().__init__("Un mismo producto no puede repetirse en el pedido")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, stock: int):
        super().__init__(f"Stock insuficiente para '{nombre}': quedan {stock}")


class TransicionInvalida(Exception):
    def __init__(self, actual: str, nuevo: str):
        super().__init__(f"No se puede pasar un pedido de {actual} a {nuevo}")


class PedidoNoCancelable(Exception):
    def __init__(self, estado: str):
        super().__init__(f"Solo se puede cancelar un pedido PENDIENTE; este está {estado}")


def _es_admin(usuario: UserPublic) -> bool:
    return usuario.role == "admin"


class PedidoService:
    """Reglas de negocio de pedidos (RN-01 a RN-06). Cada caso de uso corre en un Unit of Work."""

    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def _buscar(self, uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    def _verificar_dueno(self, pedido: Pedido, usuario: UserPublic) -> None:
        """RN-04: el cliente solo accede a sus propios pedidos."""
        if pedido.usuario_id != usuario.id:
            raise PedidoAjeno()

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock lo que se había descontado, línea por línea."""
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            uow.productos.update(producto, {"stock": producto.stock + linea.cantidad})

    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        """RN-01: todo en una transacción. Si una validación falla, no se guarda nada."""
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido()

            pedido = uow.pedidos.add(Pedido(
                usuario_id=usuario_id,
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
            ))
            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_activo(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock)

                uow.productos.update(producto, {"stock": producto.stock - item.cantidad})
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,  # RN-05: copia, no cambia después
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                ))
                total += subtotal

            pedido = uow.pedidos.update(pedido, {"total": round(total, 2)})
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario: UserPublic, estado: str | None, skip: int, limit: int) -> PedidosPaginados:
        """El admin ve todos los pedidos; un user, solo los suyos (RN-04)."""
        with self.uow as uow:
            dueno = None if _es_admin(usuario) else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(dueno, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if not _es_admin(usuario):
                self._verificar_dueno(pedido, usuario)
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: str) -> PedidoRead:
        """RN-02 y RN-03: el admin avanza o cancela según la máquina de estados."""
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if nuevo not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(pedido.estado, nuevo)
            if nuevo == "CANCELADO":
                self._restituir_stock(uow, pedido)
            return PedidoRead.model_validate(uow.pedidos.update(pedido, {"estado": nuevo}))

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """RN-03 y RN-04: el dueño cancela su pedido, solo si está PENDIENTE."""
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            self._verificar_dueno(pedido, usuario)
            if pedido.estado != "PENDIENTE":
                raise PedidoNoCancelable(pedido.estado)
            self._restituir_stock(uow, pedido)
            return PedidoRead.model_validate(uow.pedidos.update(pedido, {"estado": "CANCELADO"}))

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_de_hoy_utc()),
                ingresos_entregados=uow.pedidos.suma_total_por_estado("ENTREGADO"),
            )
