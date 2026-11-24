import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminUsersPage, LoginPage, RegisterPage } from "@/features/auth";
import { CarritoPage } from "@/features/cart";
import { CategoriesPage } from "@/features/categories";
import { CheckoutPage, MisPedidosPage } from "@/features/pedidos";
import { CatalogoPage, ProductsPage } from "@/features/products";
import Navbar from "@/shared/components/Navbar";
import UnauthorizedPage from "@/shared/components/UnauthorizedPage";
import ProtectedRoute from "./ProtectedRoute";

// Todas las rutas de la aplicación, agrupadas por nivel de acceso
export function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Públicas: el catálogo y el carrito se ven sin sesión */}
        <Route path="/" element={<CatalogoPage />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Con sesión, cualquier rol: comprar y ver los pedidos propios */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/mis-pedidos" element={<MisPedidosPage />} />
        </Route>

        {/* Panel de administración: solo admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/categorias" element={<CategoriesPage />} />
          <Route path="/admin/productos" element={<ProductsPage />} />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
        </Route>

        {/* Rutas desconocidas: al catálogo */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
