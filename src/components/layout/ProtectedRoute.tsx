import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authSelectors, useAuthStore } from "../../store/authStore";

export const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
