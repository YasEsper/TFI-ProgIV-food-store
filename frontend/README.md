# Frontend – Food Store por features y con rutas protegidas (Unidad 10 · Programación IV)

Refactor del frontend de la Unidad 9 (React + TypeScript + Vite + Tailwind CSS 4). Tiene el mismo CRUD de categorías, ingredientes y productos y la misma interfaz según el rol, pero ahora:

- el código está organizado **por features** (`auth`, `categories`, `products`, `ingredients`), cada una con su barrel `index.ts`;
- los imports entre carpetas usan el **alias `@/`**;
- las rutas están en `routes/AppRouter.tsx` y las protege `ProtectedRoute` **por sesión y por rol**;
- cada feature tiene su **custom hook** con TanStack Query, y las páginas no llaman a Axios ni a TanStack Query;
- hay un **estado global de interfaz** con Zustand: tema claro u oscuro (con `persist`) y notificaciones (`Toast`).

El backend es el de la Unidad 9 y no cambia (FastAPI, JWT en una cookie HttpOnly, roles `user` y `admin`).

## Estructura por features

```
src/
├── features/
│   ├── auth/
│   │   ├── components/   TarjetaAuth.tsx (marco de login y registro)
│   │   ├── hooks/        useAuth.ts, useAdminUsers.ts
│   │   ├── services/     auth.service.ts, usuarios.service.ts (llamadas a /auth/...)
│   │   ├── store/        authStore.ts (Zustand, sin persist)
│   │   ├── types/        auth.types.ts (Rol, UsuarioAuth, UsuarioPublico...)
│   │   ├── pages/        LoginPage, RegisterPage, AdminUsersPage
│   │   └── index.ts      barrel: useAuthStore, useAuth, las páginas y los tipos públicos
│   ├── categories/
│   │   ├── components/   CategoriaList.tsx, CategoriaModal.tsx
│   │   ├── hooks/        useCategories.ts
│   │   ├── services/     categories.service.ts
│   │   ├── types/        categoria.types.ts
│   │   ├── pages/        CategoriesPage.tsx
│   │   └── index.ts
│   ├── products/         (misma estructura; components/ suma EtiquetasCategorias.tsx)
│   └── ingredients/      (misma estructura)
├── shared/
│   ├── components/       Navbar, UnauthorizedPage, Toast, ThemeToggle, ConfirmModal
│   │   └── ui/           Button, Tabla, ModalFormulario, CampoTexto, CampoNumero, Insignia...
│   └── api/
│       ├── api.ts                instancia de Axios (withCredentials), pedir(), mensajeDeError()
│       └── setupInterceptors.ts  interceptor de 401 y 403 (se importa una vez en main.tsx)
├── store/
│   ├── themeStore.ts         darkMode + toggleTheme, persist "theme-storage"
│   └── notificationStore.ts  mensaje, tipo y visibilidad del Toast
├── routes/
│   ├── AppRouter.tsx         todas las rutas, agrupadas por nivel de acceso
│   └── ProtectedRoute.tsx    guardián por sesión y rol (con <Outlet />)
├── App.tsx                   checkAuth al iniciar + <AppRouter /> + <Toast />
├── main.tsx                  QueryClientProvider e interceptores
└── index.css                 Tailwind, colores del design system y variante dark
```

Cada feature, además de las carpetas que pide la consigna, tiene `services/`: ahí van las funciones que llaman a la API. El hook de la feature es el único que las usa, junto con TanStack Query.

### Reglas que se respetan

- **Una feature solo importa de otra a través de su barrel.** Por ejemplo, las páginas de categorías leen el rol con `import { useAuth } from "@/features/auth"`. Ningún archivo importa desde `@/features/<otra>/<subcarpeta>`.
- Lo que usan varias features está en `shared/` (componentes, Axios) o en `store/` (stores de interfaz).
- Los imports entre carpetas usan `@/features/...`, `@/shared/...`, `@/store/...` y `@/routes/...`. Dentro de una misma feature se usan imports relativos cortos (`../hooks/useCategories`).
- `App.tsx` no tiene lógica de negocio.
- La sesión **no** se guarda en `localStorage` ni en `sessionStorage`. Solo se guarda la preferencia de tema.

### Alias `@/`

Está declarado en dos lugares:

- `vite.config.ts`: `resolve.alias` con `"@": path.resolve(import.meta.dirname, "src")`. Lo usa Vite en `pnpm dev` y en el build.
- `tsconfig.app.json`: `"paths": { "@/*": ["./src/*"] }`. Lo usa TypeScript en el editor y en `tsc`.

## Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/login`, `/register`, `/unauthorized` | Login, registro y acceso denegado | Públicas (no pasan por `ProtectedRoute`) |
| `/categories`, `/ingredients`, `/products` | CRUD (el de productos muestra las categorías de cada producto) | `<ProtectedRoute />`: cualquier usuario autenticado |
| `/admin/users` | Usuarios con su estado y los botones Activar y Desactivar | `<ProtectedRoute allowedRoles={["admin"]} />` |
| cualquier otra | Redirige a `/categories` (y de ahí al login si no hay sesión) | — |

### `ProtectedRoute`

Lee `status` y `hasRole` del store de autenticación:

| Estado de sesión | Rol | Resultado |
|---|---|---|
| `checking` (esperando `/auth/me`) | — | "Verificando sesión...", sin redirigir |
| `unauthenticated` | — | `<Navigate to="/login" />`, guardando la ruta pedida en `state.from` |
| `authenticated` | `user` en una ruta que requiere `admin` | `<Navigate to="/unauthorized" />` |
| `authenticated` | rol permitido | `<Outlet />`: se muestra la página |

Después del login, `LoginPage` vuelve a la ruta guardada en `state.from`; si no hay ninguna, va a `/categories`.

## Sesión, 401 y 403

- **`authStore`** (`features/auth/store`) guarda `user` y `status` (`checking`, `authenticated` o `unauthenticated`) y tiene `checkAuth`, `login`, `logout`, `clearSession` y `hasRole(...roles)`. El backend devuelve una **lista** de roles vigentes, por eso `hasRole` usa `roles.some(...)`.
- **No usa `persist`** (a diferencia de la Unidad 9). El token viaja en la cookie HttpOnly. Al recargar, `App.tsx` llama a `checkAuth()`, que pide `GET /auth/me`, y mientras tanto el estado `checking` evita redirigir antes de tiempo.
- **`setupInterceptors.ts`**:
  - **401** (salvo en `/auth/token` y `/auth/me`): llama a `clearSession()`, y `ProtectedRoute` lleva al login.
  - **403**: muestra la notificación "Acceso denegado: no tenés permisos para esta acción". No cierra la sesión ni redirige.
- Ocultar botones según el rol (`isAdmin`) mejora la interfaz, pero **la seguridad la aplica el backend**, que valida la cookie y el rol en cada petición.

## Custom hooks

| Hook | Qué encapsula |
|---|---|
| `useCategories`, `useProducts`, `useIngredients` | `useQuery` para el listado (`GET`) y `useMutation` para crear (`POST`), editar (`PUT`) y eliminar (`DELETE`). Después de cada operación invalidan el listado y avisan con el Toast; los errores también se avisan (el 403 lo avisa el interceptor) |
| `useAuth` | `login`, `logout` (además vacía la caché de TanStack Query), `register` y la lectura del store: `user`, `status`, `isAuthenticated`, `isAdmin` |
| `useAdminUsers` | Listado de usuarios y la mutación para activar o desactivar |

Las páginas solo manejan el estado de la interfaz (modal abierto, fila seleccionada, formulario y tabla). Los errores de validación del backend (por ejemplo, un 409 por nombre repetido) se siguen mostrando dentro del modal, sin cerrarlo.

## Estado global de interfaz

- **`themeStore`**: tiene `darkMode` y `toggleTheme`, con `persist` y la clave `theme-storage`. El botón "Modo oscuro / Modo claro" está en la Navbar. El store pone o saca la clase `dark` en `<html>`, y `index.css` declara `@custom-variant dark (&:where(.dark, .dark *))`, así las clases `dark:` de Tailwind siguen al store y no a la preferencia del sistema.
- **`notificationStore`**: tiene `message`, `tipo` (`success` o `error`), `show`, `showNotification` y `hideNotification`. `Toast` se monta una vez en `App.tsx` y se oculta solo a los 3 segundos. Cada aviso nuevo reinicia el tiempo, aunque repita el mismo texto.

## Requisitos e instalación

- Node.js 20 o superior y pnpm.
- El **backend de la Unidad 9 levantado**, con el seed corrido (`python -m app.db.seed`).

```bash
pnpm install
pnpm dev
```

La aplicación queda en http://localhost:5173 y arranca en `/login`. Para entrar como administrador se usa el usuario del seed, **`admin@foodstore.com` / `Admin1234!`**. Un usuario nuevo se crea desde "Registrate" y recibe el rol `user`.

`pnpm build` verifica los tipos (`tsc -b`) y arma el build.

### URL del backend

Por defecto la API es `http://localhost:8000`. Para cambiarla, se copia `.env.example` como `.env.local`:

```
VITE_API_URL=http://localhost:8000
```

El frontend y el backend tienen que estar en el mismo host (`localhost` con `localhost`, o `127.0.0.1` con `127.0.0.1`): la cookie de sesión es `SameSite=Lax`, y `localhost` y `127.0.0.1` cuentan como sitios distintos.

## Notas

- **Ingredientes:** el TP pide la feature `ingredients`. El backend de la Unidad 9 tiene el CRUD de ingredientes protegido igual que categorías: lectura con sesión, escritura solo para admin, nombre único y borrado lógico.
- `pnpm lint` muestra el aviso "Compilation Skipped: Use of incompatible library" en `useReactTable`. Pasa porque TanStack Table no es compatible con React Compiler, que este proyecto no usa. No es un error.
- Las imágenes y las categorías de un producto no se editan desde el front.
