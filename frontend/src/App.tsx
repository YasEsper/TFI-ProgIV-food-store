import { useEffect } from "react";
import { useAuthStore } from "@/features/auth";
import { AppRouter } from "@/routes/AppRouter";
import Toast from "@/shared/components/Toast";

// Sin lógica de negocio (RA-04): verifica la sesión al iniciar y monta el router y el Toast
function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth(); // la cookie decide si la sesión sigue vigente (GET /auth/me)
  }, [checkAuth]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;
