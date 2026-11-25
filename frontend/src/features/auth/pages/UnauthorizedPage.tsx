import { Link } from "react-router-dom";

// Acceso denegado: hay sesión, pero el rol no alcanza para la ruta pedida
function UnauthorizedPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <p className="text-5xl font-bold text-gray-300 dark:text-gray-600">403</p>
      <h2 className="text-2xl font-semibold">Acceso denegado</h2>
      <p className="text-gray-600 dark:text-gray-300">No tenés permisos para ver esta página.</p>
      <Link to="/" className="btn bg-primary px-4 py-2 text-white hover:bg-primary-hover">
        Volver al catálogo
      </Link>
    </main>
  );
}

export default UnauthorizedPage;
