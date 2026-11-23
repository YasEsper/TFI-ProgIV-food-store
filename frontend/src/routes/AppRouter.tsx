import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminUsersPage, LoginPage, RegisterPage } from "@/features/auth";
import { CategoriesPage } from "@/features/categories";
import { IngredientsPage } from "@/features/ingredients";
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

        {/* Cualquier usuario autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/ingredients" element={<IngredientsPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Route>

        {/* Solo admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

        {/* Inicio y rutas desconocidas: al catálogo (ProtectedRoute lleva al login si no hay sesión) */}
        <Route path="*" element={<Navigate to="/categories" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
