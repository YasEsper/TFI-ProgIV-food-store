import { useEffect } from "react";
import { useAuthStore } from "@/features/auth";
import { AppRouter } from "@/routes/AppRouter";
import Toast from "@/shared/components/Toast";

// Sin lógica de negocio: confirma la sesión al iniciar y monta el router y el Toast
function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  // La única llamada en un useEffect: la cookie decide si la sesión sigue vigente (GET /auth/me)
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;
