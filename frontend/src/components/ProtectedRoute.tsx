// src/components/ProtectedRoute.tsx
import { useContext, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface Props {
  children: JSX.Element;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
