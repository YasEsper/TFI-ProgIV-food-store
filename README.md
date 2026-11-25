# Food Store

Trabajo Práctico Integrador de Programación IV - Tecnicatura Universitaria en Programación a Distancia (UTN).
Alumna: Esper Amira Yasmin.

Food Store es una aplicación web para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un carrito y confirman el pedido indicando la dirección de entrega y la forma de pago. El negocio maneja categorías, productos, stock, pedidos y usuarios desde un panel de administración.

- **Repositorio:** https://github.com/YasEsper/TFI-ProgIV-food-store
- **Video de demostración:** https://drive.google.com/drive/folders/1GCFkrQ9zJRZlG_sMGzb-G5HhQbUobXpM (archivo `TPI_Food_Store_Esper.mp4` dentro de la carpeta)

## Qué se puede hacer

**Como cliente (rol `user`)**

- Crear una cuenta e ingresar con usuario y contraseña. Toda cuenta creada desde el registro tiene rol `user`.
- Ver el catálogo sin iniciar sesión: búsqueda por nombre, filtro por categoría y paginado resuelto en el servidor. Mientras carga se muestra un skeleton y, si la búsqueda no encuentra nada, un mensaje de estado vacío.
- Armar el carrito, que queda guardado en el navegador aunque se recargue la página.
- Confirmar el pedido con dirección de entrega, forma de pago (efectivo o transferencia) y notas opcionales.
- Ver «Mis pedidos» con el detalle de cada uno y cancelarlo mientras está `PENDIENTE`.

**Como administrador (rol `admin`)**

- Resumen con la cantidad de pedidos por estado, los pedidos del día y los ingresos de los pedidos entregados.
- Pedidos de todos los clientes, con filtro por estado y botones para avanzarlos o cancelarlos según la máquina de estados.
- Categorías y productos: alta, edición y baja lógica, con un formulario aparte para cambiar solo el stock y la disponibilidad.
- Usuarios: activar y desactivar cuentas. El admin no puede desactivar su propia cuenta.

## Tecnologías

**Backend** (versiones exactas en `backend/requirements.txt`)

- FastAPI para la API REST, con la documentación automática en `/docs` y `/redoc`.
- SQLModel para los modelos y los schemas, sobre PostgreSQL con `psycopg2-binary`.
- pydantic-settings para la configuración, que se lee de `backend/.env`.
- python-jose para el JWT, guardado en una cookie `HttpOnly`, y passlib con bcrypt 4.0.1 para el hash de las contraseñas.

**Frontend** (versiones exactas en `frontend/package.json` y `pnpm-lock.yaml`)

- React 19 con TypeScript en modo `strict`, Vite y Tailwind CSS 4.
- React Router, con las rutas privadas protegidas por `ProtectedRoute` según el rol.
- Axios configurado con `withCredentials` y un interceptor que limpia la sesión ante un 401 o una cuenta desactivada.
- TanStack Query para los datos del servidor, TanStack Form para los formularios y TanStack Table para las tablas del panel.
- Zustand con `persist` para la sesión (`authStore`) y el carrito (`cartStore`).

## Organización del código

```
backend/    API REST (FastAPI + SQLModel + PostgreSQL)
frontend/   Aplicación web (React + TypeScript + Vite + Tailwind)
README.md   Este archivo
```

En el backend, `app/core/` tiene lo compartido (configuración, base de datos, seguridad, dependencias de sesión y rol, Unit of Work y repositorio base) y `app/modules/` tiene un paquete por dominio: `auth`, `usuarios`, `categorias`, `productos` y `pedidos`. Cada módulo sigue la cadena router → service → unit of work → repository → model / schema. La carga inicial está en `app/db/seed.py`.

En el frontend, `src/features/` tiene una carpeta por dominio, igual que los módulos del backend: `auth`, `categorias`, `productos`, `usuarios` y `pedidos` (que incluye el carrito y el checkout). Cada una agrupa sus páginas, componentes, hooks, servicios y tipos. Lo común está en `src/shared/` (cliente de la API, componentes visuales y `layout/` con la barra de navegación), el estado del cliente en `src/store/` (`authStore` y `cartStore`) y las rutas en `src/routes/`. Las imágenes de los productos, el logo y los íconos están en `frontend/public/img/`.

## Requisitos

- Python 3.11 o superior. Lo desarrollé con Python 3.14 usando SQLModel 0.0.50, que sí es compatible con 3.14 (el problema con 3.14 que menciona la consigna es de SQLModel 0.0.22).
- PostgreSQL 15 o superior.
- Node.js 20.19 o superior y pnpm 9 o superior. Lo probé con Node 24 y pnpm 11.

## Backend

### 1. Crear la base de datos

Alcanza con una base vacía. Por ejemplo, desde `psql` o pgAdmin:

```sql
CREATE DATABASE foodstore_tpi;
```

Las tablas no se crean a mano: las crea el seed o la API al arrancar.

### 2. Instalar las dependencias

Desde la carpeta `backend/`, en PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

En Linux o macOS: `python3 -m venv .venv`, `source .venv/bin/activate` y `cp .env.example .env`.

### 3. Completar el `.env`

Abrir `backend/.env` y completar los valores:

| Variable | Para qué sirve | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql+psycopg2://postgres:CONTRASEÑA@localhost:5432/foodstore_tpi` |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | se genera con `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión (token y cookie) | `30` |
| `FRONTEND_ORIGIN` | Origen que acepta CORS | `http://localhost:5173` |

El `.env.example` trae el puerto 5433 porque es el que usa PostgreSQL en mi máquina; en una instalación estándar es 5432. Para una prueba rápida sin PostgreSQL también funciona `DATABASE_URL=sqlite:///./foodstore.db`.

El `.env` no se sube al repositorio.

### 4. Cargar los datos iniciales

Con el entorno virtual activado, desde `backend/`:

```powershell
python -m app.db.seed
```

Carga el usuario administrador, 3 categorías (Pizzas, Hamburguesas y Bebidas) y 8 productos con stock e imagen. Se puede correr más de una vez: lo que ya existe no se vuelve a crear.

**Usuario administrador:** `admin` / `Admin1234!`

### 5. Levantar la API

```powershell
uvicorn app.main:app --reload
```

Si Windows bloquea `uvicorn.exe` (por ejemplo, con Smart App Control), el mismo comando se puede correr así:

```powershell
python -m uvicorn app.main:app --reload
```

- API: `http://localhost:8000/api/v1`
- Documentación: `http://localhost:8000/docs` y `http://localhost:8000/redoc`

## Frontend

Desde la carpeta `frontend/`, con el backend ya levantado:

```powershell
pnpm install
Copy-Item .env.example .env
pnpm dev
```

La aplicación queda en `http://localhost:5173`.

La única variable es `VITE_API_URL` (en `frontend/.env.example`): la dirección de la API con el prefijo `/api/v1`, por ejemplo `http://localhost:8000/api/v1`.

Para revisar los tipos y generar la versión de producción:

```powershell
pnpm build
```

## Recorrido para probarlo

1. Abrir `http://localhost:5173`, buscar un producto, filtrar por categoría y anotar el stock de alguno, por ejemplo la Pizza napolitana.
2. Registrarse desde «Registrarse», iniciar sesión y agregar ese producto al carrito.
3. Ir a «Carrito» → «Confirmar pedido», completar dirección y forma de pago y confirmar. El pedido aparece en «Mis pedidos» como `PENDIENTE` y en el catálogo el stock bajó.
4. Cancelar el pedido desde «Mis pedidos»: el stock vuelve al valor anterior.
5. En otra ventana de incógnito (para no mezclar las sesiones), ingresar como `admin`. En «Pedidos», avanzar un pedido con «Preparar» y «Entregar», y ver en «Resumen» cómo se actualizan los contadores y los ingresos.
6. Con la cuenta de cliente, entrar a `http://localhost:5173/admin/pedidos`: la aplicación muestra la página de acceso denegado.

## Decisiones de diseño

- **Sesión:** el JWT viaja en la cookie `HttpOnly` `access_token`. El frontend nunca lo lee ni lo guarda; en el navegador solo quedan los datos públicos del usuario y el carrito.
- **Unit of Work:** en categorías, productos y pedidos, el service abre el Unit of Work y el commit o el rollback se hacen solo al salir de él. Por eso un pedido se guarda completo o no se guarda: si un producto no tiene stock suficiente, no queda ni el pedido ni el descuento de los demás productos.
- **Precios fijos en el pedido:** cada línea copia el nombre y el precio del producto al momento de la compra. Si después el admin cambia el precio, los pedidos anteriores no se modifican.
- **Máquina de estados:** las transiciones válidas están en un diccionario dentro del service de pedidos y se validan antes de cambiar el estado. Un cambio inválido responde 400. Entregado y Cancelado son estados finales.
- **Bajas lógicas:** categorías y productos usan `activo` y los usuarios `disabled`. Una categoría dada de baja no libera su nombre, para no confundir datos viejos con nuevos. Los pedidos no se borran: se cancelan.
- **Imágenes:** los productos guardan la imagen como URL. Las del seed están en `frontend/public/img/` y se cargan como `/img/nombre.jpg`, así se ven sin depender de sitios externos.
