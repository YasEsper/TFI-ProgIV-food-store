import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminUsersPage, LoginPage, RegisterPage } from "@/features/auth";
import { CategoriesPage } from "@/features/categories";
import { ProductsPage } from "@/features/products";
import Navbar from "@/shared/components/Navbar";
import UnauthorizedPage from "@/shared/components/UnauthorizedPage";
import ProtectedRoute from "./ProtectedRoute";

// Todas las rutas de la aplicación, agrupadas por nivel de acceso
export function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Panel de administración: solo admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/categorias" element={<CategoriesPage />} />
          <Route path="/admin/productos" element={<ProductsPage />} />
          <Route path="/admin/usuarios" element={<AdminUsersPage />} />
        </Route>

        {/* Inicio y rutas desconocidas: por ahora al panel (el catálogo llega con las pantallas del cliente) */}
        <Route path="*" element={<Navigate to="/admin/productos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
