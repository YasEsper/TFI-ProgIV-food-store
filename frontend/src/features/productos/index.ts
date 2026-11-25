// API pública de la feature de productos
export { default as AdminProductosPage } from "./pages/AdminProductosPage";
export { default as CatalogoPage } from "./pages/CatalogoPage";
export { useProductos } from "./hooks/useProductos";
export { getProductos } from "./services/productos.service";
export type { FiltrosProductos, Producto, ProductosPaginados } from "./types/producto.types";
