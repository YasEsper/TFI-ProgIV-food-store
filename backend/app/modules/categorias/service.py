from app.modules.categorias.model import Categoria
from app.modules.categorias.schema import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int):
        super().__init__(f"Categoría {categoria_id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def _buscar(self, uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_activa(categoria_id)
        if categoria is None:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria

    def _validar_nombre_libre(self, uow: CategoriaUnitOfWork, nombre: str, excepto_id: int | None = None) -> None:
        otra = uow.categorias.get_by_nombre(nombre)
        if otra is not None and otra.id != excepto_id:
            raise NombreDuplicado(nombre)

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.listar_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._buscar(uow, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._validar_nombre_libre(uow, datos.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(datos))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._buscar(uow, categoria_id)
            # Solo los campos enviados; un null no borra el nombre (columna obligatoria)
            cambios = datos.model_dump(exclude_unset=True, exclude_none=True)
            if "nombre" in cambios:
                self._validar_nombre_libre(uow, cambios["nombre"], excepto_id=categoria_id)
            return CategoriaRead.model_validate(uow.categorias.update(categoria, cambios))

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: la fila queda en la base con activo = False."""
        with self.uow as uow:
            uow.categorias.update(self._buscar(uow, categoria_id), {"activo": False})