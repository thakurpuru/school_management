import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const ProtectedRoute = () => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-700">
        Checking admin session...
      </div>
    );
  }

  return admin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
