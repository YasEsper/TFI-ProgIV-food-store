// API pública de la feature de productos
export { default as ProductsPage } from "./pages/ProductsPage";
export { default as CatalogoPage } from "./pages/CatalogoPage";
export { useProducts } from "./hooks/useProducts";
export { getProductos } from "./services/products.service";
export type { FiltrosProductos, Producto, ProductosPaginados } from "./types/producto.types";
