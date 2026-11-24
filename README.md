# Food Store - Trabajo Práctico Integrador (Programación IV)

Aplicación web para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un carrito y confirman un pedido con dirección de entrega y forma de pago. El administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Repositorio:** https://github.com/YasEsper/TFI-ProgIV-food-store
- **Video de demostración:** https://drive.google.com/drive/folders/1GCFkrQ9zJRZlG_sMGzb-G5HhQbUobXpM (archivo `TPI_Food_Store_Esper.mp4` dentro de la carpeta)
- **Alumna:** Esper Amira Yasmin

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Backend | Python, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly, Passlib + bcrypt, pydantic-settings |
| Frontend | React 19, TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query, TanStack Form, TanStack Table, Zustand, Axios, React Router |

Las versiones exactas están fijadas en `backend/requirements.txt` y `frontend/package.json`.

## Requisitos

- **Python 3.11 o superior.** El proyecto se desarrolló con Python 3.14 y SQLModel 0.0.50, que sí funciona con 3.14 (la advertencia de la consigna corresponde a SQLModel 0.0.22).
- **PostgreSQL 15 o superior.**
- **Node.js 20.19 o superior** y **pnpm 9 o superior** (`npm install -g pnpm`).

## 1. Base de datos

Crear una base vacía en PostgreSQL (las tablas las crea la aplicación):

```sql
CREATE DATABASE foodstore_tpi;
```

## 2. Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate          # en Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env          # en Linux/Mac: cp .env.example .env
```

Editar `backend/.env` con los datos de la base (ver «Variables de entorno»). Después cargar los datos iniciales y levantar la API:

```powershell
python -m app.db.seed
uvicorn app.main:app --reload
```

Si Windows bloquea `uvicorn.exe` (por ejemplo, con Smart App Control), usar la forma equivalente:

```powershell
python -m uvicorn app.main:app --reload
```

La API queda en http://localhost:8000. La documentación está en http://localhost:8000/docs y http://localhost:8000/redoc.

## 3. Frontend

En otra terminal:

```powershell
cd frontend
pnpm install
copy .env.example .env          # en Linux/Mac: cp .env.example .env
pnpm build                      # verifica los tipos
pnpm dev
```

La aplicación queda en http://localhost:5173.

## Variables de entorno

**`backend/.env`** (copiar de `backend/.env.example`):

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql+psycopg2://postgres:CONTRASEÑA@localhost:5432/foodstore_tpi` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | se genera con `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión (cookie y token) | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

El `.env.example` usa el puerto 5433 porque así está instalado PostgreSQL en la máquina de desarrollo; con una instalación estándar el puerto es 5432.

**`frontend/.env`** (copiar de `frontend/.env.example`):

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL de la API, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

## Usuario del seed

`python -m app.db.seed` es idempotente (se puede correr varias veces sin duplicar nada) y carga:

- el usuario administrador **`admin`** con contraseña **`Admin1234!`**;
- 3 categorías: Pizzas, Hamburguesas y Bebidas;
- 8 productos con stock e imagen.

Los clientes se crean desde la pantalla de registro y siempre tienen rol `user`.

## Funcionalidades

**Cliente (rol `user`)**
- Catálogo público con búsqueda por nombre, filtro por categoría y paginado en el servidor.
- Carrito que se conserva al recargar la página.
- Checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas.
- «Mis pedidos» con el detalle de cada pedido y cancelación mientras está pendiente.

**Administrador (rol `admin`)**
- Resumen con pedidos por estado, pedidos del día e ingresos de los pedidos entregados.
- Gestión de pedidos: filtro por estado, avanzar (Pendiente → En preparación → Entregado) y cancelar.
- ABM de categorías y productos, con cambio de stock y disponibilidad.
- Gestión de usuarios: activar y desactivar (el admin no puede desactivarse a sí mismo).

**Reglas de negocio**
- El pedido se crea completo o no se crea: el stock se descuenta en la misma transacción.
- Al cancelar un pedido se devuelve el stock de cada línea.
- Cada línea guarda una copia del nombre y del precio, así el pedido no cambia si después se modifica el producto.
- Los estados siguen la máquina de estados de la consigna; Entregado y Cancelado son finales.

## Estructura del proyecto

```
FoodStore/
├── backend/
│   ├── app/
│   │   ├── main.py            # app FastAPI, CORS con credenciales y prefijo /api/v1
│   │   ├── core/              # config, database, security, deps, unit_of_work, base_repository
│   │   ├── db/seed.py         # carga inicial idempotente
│   │   └── modules/           # auth, usuarios, categorias, productos, pedidos
│   │                          # (router, service, unit_of_work, repository, model, schema)
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── public/img/            # imágenes de productos, logo e íconos
│   ├── src/
│   │   ├── features/          # auth, categories, products, cart, pedidos
│   │   ├── shared/            # api (Axios), componentes y utilidades comunes
│   │   ├── store/             # authStore y cartStore (Zustand con persist)
│   │   └── routes/            # AppRouter y ProtectedRoute
│   ├── .env.example
│   └── package.json
└── README.md
```

## Arquitectura

- **Backend en capas:** Router → Service → Unit of Work → Repository → Model. El commit y el rollback ocurren solo en el `__exit__` del Unit of Work; ningún Service ni Router llama a `session.commit()`.
- **Sesión:** el login guarda el JWT en la cookie HttpOnly `access_token`. El frontend nunca lee ni guarda el token; Axios envía la cookie con `withCredentials`.
- **Estado del frontend:** TanStack Query maneja los datos del servidor (catálogo, pedidos, usuarios, resumen) y Zustand el estado del cliente (sesión y carrito).
- **Rutas protegidas:** `ProtectedRoute` lleva a `/login` si no hay sesión y a `/unauthorized` si el rol no alcanza. La protección real está en el backend con `require_role`.
