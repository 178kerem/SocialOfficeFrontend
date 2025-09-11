import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth(); // token veya isAuthenticated kontrol et
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>; // children fragment içinde döndür
};

export default ProtectedRoute;