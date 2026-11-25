import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, RegisterPage, UnauthorizedPage } from "@/features/auth";
import { AdminCategoriasPage } from "@/features/categorias";
import {
  AdminPedidosPage,
  AdminResumenPage,
  CarritoPage,
  CheckoutPage,
  MisPedidosPage,
} from "@/features/pedidos";
import { AdminProductosPage, CatalogoPage } from "@/features/productos";
import { AdminUsuariosPage } from "@/features/usuarios";
import Navbar from "@/shared/layout/Navbar";
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
          <Route path="/admin/resumen" element={<AdminResumenPage />} />
          <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
          <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
          <Route path="/admin/productos" element={<AdminProductosPage />} />
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
        </Route>

        {/* Rutas desconocidas: al catálogo */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
