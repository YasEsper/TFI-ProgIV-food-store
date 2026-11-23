# Backend – Food Store con autenticación y roles (Unidad 9 · Programación IV)

API REST hecha con **FastAPI + SQLModel + PostgreSQL**, que extiende el CRUD de la Unidad 8 con un módulo de seguridad:

- **Autenticación con JWT en una cookie HttpOnly**: registro, login, logout y perfil (`/auth/me`).
- **Roles con las tablas `Rol` y `UsuarioRol`** (dominio Identidad & Acceso del diagrama `UML_FOOD_STORE`): el registro asigna `user`; las escrituras del catálogo exigen `admin`.
- **Borrado lógico con `deleted_at`** en usuarios, categorías, ingredientes, productos y pedidos.
- **Catálogos de solo lectura** (`Rol`, `EstadoPedido`, `FormaPago`) cargados con `seed.py`.

## Estructura

```
backend/
├── app/
│   ├── main.py                 # crea la app, CORS con credenciales y monta todo bajo /api/v1
│   ├── core/
│   │   ├── config.py           # Settings con pydantic-settings, leídas del .env
│   │   ├── database.py         # engine, get_session() y session_factory() (Unit of Work)
│   │   ├── security.py         # hash bcrypt, create_access_token y decode_access_token
│   │   ├── deps.py             # get_current_user, get_current_active_user, require_role, solo_admin
│   │   ├── base_repository.py  # BaseRepository: CRUD genérico, nunca hace commit
│   │   ├── unit_of_work.py     # UnitOfWork base: commit o rollback al salir del with
│   │   ├── fechas.py           # ahora_utc()
│   │   └── tipos.py            # TextoObligatorio
│   ├── db/
│   │   └── seed.py             # carga inicial idempotente
│   └── modules/
│       ├── auth/               # router, service, schema (usa el modelo Usuario)
│       ├── usuarios/           # model, schema, repository, unit_of_work, service, router
│       ├── categorias/         # model, schema, service, router
│       ├── ingredientes/       # model, schema, service, router
│       ├── productos/          # model, schema, repository, service, router
│       └── pedidos/            # model, schema, repository, unit_of_work, service, router
├── auth.http                   # registro, login, perfil, logout, admin de usuarios y catálogos
├── ingredientes.http           # CRUD de ingredientes con sus permisos
├── productos.http              # categorías, productos y su relación N:N
├── pedidos.http                # pedidos de un cliente y gestión del admin
├── .env.example
├── requirements.txt
└── README.md
```

## Requisitos

- Python 3.12 o superior (probado con 3.14)
- PostgreSQL
- VS Code con la extensión **REST Client** (para los archivos `.http`)

## Instalación

Todos los comandos se corren **dentro de la carpeta `backend`**: la configuración se lee del `.env` de esa carpeta.

1. Crear y activar el entorno virtual:

   ```bash
   python -m venv .venv
   .venv\Scripts\activate        # Windows
   source .venv/bin/activate     # macOS / Linux
   ```

2. Instalar las dependencias (con versiones fijas):

   ```bash
   pip install -r requirements.txt
   ```

3. Crear la base de datos en PostgreSQL:

   ```sql
   CREATE DATABASE tp_unidad9;
   ```

4. Copiar `.env.example` como `.env` y completarlo. La `SECRET_KEY` se genera con:

   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

   | Variable | Para qué |
   |---|---|
   | `DATABASE_URL` | Conexión a PostgreSQL (en mi equipo corre en el puerto **5433**) |
   | `SECRET_KEY` | Firma de los JWT. Obligatoria, de al menos 32 caracteres: sin ella la app no arranca |
   | `ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie (30) |
   | `FRONTEND_ORIGIN` | Origen permitido por CORS (`http://localhost:5173`) |

   > El `.env` no se entrega porque contiene la contraseña de la base y la clave de firma.

5. Cargar los datos iniciales (crea las tablas si no existen):

   ```bash
   python -m app.db.seed
   ```

   Carga los roles `admin` y `user`, los seis estados de pedido del diagrama, las formas de pago y el **usuario administrador**:

   | Email | Contraseña | Rol |
   |---|---|---|
   | `admin@foodstore.com` | `Admin1234!` | admin |

   Es idempotente: correrlo de nuevo no duplica filas.

## Ejecución

```bash
uvicorn app.main:app --reload
```

- API: http://127.0.0.1:8000/api/v1
- Documentación interactiva: http://127.0.0.1:8000/docs

> Se usa `127.0.0.1` en lugar de `localhost` porque en mi equipo otro servicio (Docker) ocupa el puerto 8000 en la dirección IPv6 de `localhost`.

## Seguridad

| Pieza | Cómo funciona |
|---|---|
| Contraseñas | Se guardan con hash **bcrypt** en `password_hash` (passlib 1.7.4 con bcrypt 4.0.1). Entre 8 y 72 caracteres; el límite de 72 se mide en bytes |
| Login | `POST /auth/token` recibe un formulario OAuth2 (`username` = email, `password`). Si es correcto, responde con un `Set-Cookie` **HttpOnly** `access_token` (SameSite=Lax, 30 minutos). El token nunca va en el cuerpo |
| JWT | Firmado con HS256 y la `SECRET_KEY`. Lleva el email (`sub`), el tipo (`access`) y el vencimiento (`exp`). Los roles **no** van en el token |
| Sesión | `get_current_user` lee la cookie, valida firma y vencimiento y busca al usuario en la base en cada petición → 401 si algo falla |
| Cuenta activa | `get_current_active_user` rechaza al usuario desactivado → 400 «Cuenta de usuario desactivada» |
| Roles | `require_role(roles)` mira los **roles vigentes** de `UsuarioRol` (sin `expires_at` o con vencimiento futuro) → 403 si no tiene ninguno |
| CORS | Origen explícito (`FRONTEND_ORIGIN`) con `allow_credentials=True`, para que el navegador mande la cookie |

## Endpoints

Todos cuelgan de `/api/v1`.

### Autenticación y usuarios

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| POST | `/auth/register` | público | 201 / 409 / 422 |
| POST | `/auth/token` | público | 200 + cookie / 400 / 401 |
| POST | `/auth/logout` | público | 200 (borra la cookie) |
| GET | `/auth/me` | sesión | 200 / 400 / 401 |
| GET | `/auth/admin/usuarios` | admin | 200 (incluye desactivados, con `activo`) |
| POST | `/auth/admin/usuarios/{id}/activar` | admin | 200 / 404 |
| POST | `/auth/admin/usuarios/{id}/desactivar` | admin | 200 / 404 |

### Catálogo de productos

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| GET | `/categorias/`, `/categorias/{id}` | sesión | 200 / 404 |
| POST, PUT, DELETE | `/categorias/...` | admin | 201 / 200 / 204, 403, 404, 409 (nombre repetido), 422 |
| GET | `/ingredientes/`, `/ingredientes/{id}` | sesión | 200 / 404 |
| POST, PUT, DELETE | `/ingredientes/...` | admin | 201 / 200 / 204, 403, 404, 409 (nombre repetido), 422. Cuerpo: `{"nombre": "Tomate"}` |
| GET | `/productos/` | sesión | 200 (cada producto con sus categorías) |
| GET | `/productos/{id}`, `/productos/{id}/categorias` | sesión | 200 / 404 |
| POST, PUT, DELETE | `/productos/...` | admin | 201 / 200 / 204, 403, 404, 422 |
| POST | `/productos/{id}/categorias` | admin | 201 / 404 / 409. Cuerpo: `{"categoria_id": 1, "es_principal": true}` |
| DELETE | `/productos/{id}/categorias/{categoria_id}` | admin | 204 / 404 |

### Pedidos

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| GET | `/pedidos/` | sesión | 200 (el admin ve todos; un user, solo los suyos) |
| GET | `/pedidos/{id}` | sesión | 200 / 404 (también si el pedido es de otro usuario) |
| POST | `/pedidos/` | user o admin | 201 / 404 / 422. Cuerpo: `{"forma_pago_codigo": "EFECTIVO", "detalles": [{"producto_id": 1, "cantidad": 2}]}` |
| PUT | `/pedidos/{id}` | admin | 200 / 404 / 409 (estado terminal). Cuerpo: `{"estado_codigo": "CONFIRMADO"}` |
| DELETE | `/pedidos/{id}` | admin | 204 / 404 |

### Catálogos (solo lectura)

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| GET | `/roles`, `/estados-pedido`, `/formas-pago` | sesión | 200; cualquier escritura → 405 |

## Reglas de negocio

| Regla | Cómo se cumple |
|---|---|
| RN-01 | `hash_password()` con bcrypt antes de guardar; la contraseña en texto plano nunca llega al modelo |
| RN-02 | Email y nombre de rol únicos en la tabla; el service responde 409 antes de guardar. Lo mismo con el nombre de categoría y de ingrediente |
| RN-03 | El JWT viaja solo en la cookie HttpOnly; `OAuth2PasswordBearerWithCookie` no acepta el encabezado `Authorization` |
| RN-04 | `dependencies=[solo_admin]` en cada escritura de categorías, ingredientes, productos y `ProductoCategoria` → 403 |
| RN-05 | `PedidoCreate` no tiene `usuario_id`: el router lo toma del usuario de la sesión |
| RN-06 | Los catálogos solo tienen rutas GET → 405 ante una escritura; se cargan con `seed.py` |
| RN-07 | Las lecturas exigen `get_current_active_user`, a nivel de router |
| RN-08 | `AuthService.registrar` crea el usuario y su fila en `UsuarioRol` con el rol `user` en una sola transacción |
| RN-09 | `EmailStr` y `Field(min_length=8)` en `UserCreate` → 422 |
| RN-10 | `get_current_user` valida el JWT en cada petición protegida → 401 |
| RN-11 | DELETE completa `deleted_at`; los listados filtran `deleted_at IS NULL`. Quitar una categoría de un producto borra solo la fila de enlace |
| RN-12 | Toda validación ocurre antes de escribir; los errores salen con `HTTPException` (`{"detail": ...}`) |
| RN-13 | Los datos del usuario se confirman con `/auth/me` (lado del frontend) |
| RN-14 | `roles_vigentes()` filtra por `expires_at IS NULL OR expires_at > ahora` |

## Pruebas con REST Client

1. Correr el seed y levantar el servidor.
2. Abrir el archivo `.http` en VS Code y hacer clic en **Send Request** sobre cada petición, **de arriba hacia abajo**. REST Client guarda la cookie del login y la manda en las peticiones siguientes, igual que el navegador.
3. Correr primero `auth.http`, que registra al cliente que usan los demás.

| Archivo | Qué cubre |
|---|---|
| `auth.http` | Registro (201, 409, 422), login (200, 401), `/me` con y sin sesión, 403 para un user, catálogos (200 y 405), logout, y el admin desactivando (400 en el login) y reactivando al cliente |
| `ingredientes.http` | 401 sin sesión, lectura (200) y 403 para un user; como admin: crear, 409 por nombre repetido (al crear y al editar), 422, editar, obtener, listar y borrado lógico (404 después) |
| `productos.http` | 401 sin sesión y 403 para un user; como admin: categorías (409 por nombre), productos (422), categoría principal única, quitar una categoría y borrado lógico |
| `pedidos.http` | El cliente crea pedidos (el `usuario_id` del cuerpo se ignora), errores 401, 404 y 422, y 403 al cambiar el estado; el admin avanza el estado, 409 en un estado terminal, borrado lógico |

## Decisiones de diseño

- **Estructura `core/` + `modules/`**, la del Trabajo Práctico Integrador. Se descartó dejar los módulos sueltos en `app/` (como en la Unidad 8) porque la consigna pide `app/modules/usuarios/` y así todo queda con el mismo criterio.
- **Los ingredientes se mantienen del CRUD de la Unidad 8.** La consigna dice que el modelo del diagrama no los incluye, pero no pide quitarlos, y la Unidad 10 parte de un backend con categorías, productos e ingredientes. Se protegen igual que las categorías (lectura con sesión, escritura solo admin, nombre único y borrado lógico) y siguen sin relación con productos, como en la Unidad 8.
- **Los roles se consultan en la base en cada petición, no se guardan en el token.** Un rol puede vencer (`expires_at`) o el admin puede desactivar la cuenta; con los roles dentro del JWT, el usuario seguiría con esos permisos hasta que el token venza.
- **`UsuarioRol` y `ProductoCategoria` son clases propias, no `link_model`.** Tienen datos propios (`expires_at`, `es_principal`) que con un `link_model` no se verían.
- **Mismo mensaje para email inexistente y contraseña incorrecta**, para no revelar qué emails están registrados. La cuenta desactivada se informa recién después de validar la contraseña.
- **Un pedido ajeno responde 404, no 403**, para que un user no pueda averiguar qué pedidos existen.
- **Los estados de pedido son una tabla y no un `Enum`.** Así lo muestra el diagrama; `es_terminal` impide cambiar un pedido ENTREGADO o CANCELADO (409) sin escribir los nombres en el código.
- **El nombre de una categoría borrada sigue ocupado**, porque en el diagrama es único en toda la tabla. Ingredientes sigue el mismo criterio.
- **Categorías, ingredientes y productos conservan la estructura del TP 7** (service con `Session`); usuarios y pedidos usan Unit of Work, porque registrar un usuario o crear un pedido escribe en varias tablas a la vez.
- **Formas de pago EFECTIVO y TRANSFERENCIA**: el diagrama define la tabla pero no sus valores; se tomaron los del Trabajo Práctico Integrador.
