from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_db_and_tables
# Modelos: se importan para que create_all cree sus tablas
from app.modules.categorias.model import Categoria  # noqa: F401
from app.modules.productos.model import Producto  # noqa: F401
from app.modules.pedidos.model import Pedido, DetallePedido, EstadoPedido, FormaPago  # noqa: F401
from app.modules.usuarios.model import Usuario  # noqa: F401
# Routers
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categoria_router
from app.modules.productos.router import router as producto_router
from app.modules.pedidos.router import catalogos_router, router as pedido_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="API Food Store", lifespan=lifespan)

# Con credenciales (la cookie), el origen se declara explícito: no se admite "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Todos los endpoints cuelgan de /api/v1
api = APIRouter(prefix="/api/v1")
api.include_router(auth_router)
api.include_router(usuarios_router)
api.include_router(categoria_router)
api.include_router(producto_router)
api.include_router(pedido_router)
api.include_router(catalogos_router)
app.include_router(api)