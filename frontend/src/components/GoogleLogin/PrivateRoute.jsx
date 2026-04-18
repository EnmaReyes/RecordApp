import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { useCurrencies } from "../../context/CurrencyProvider.jsx";

const PrivateRoute = ({ children, requiredRole }) => {
  const { auth } = useCurrencies();

  if (!auth) return <Navigate to="/" />;
  if (requiredRole && auth.role !== requiredRole) return <Navigate to="/" />;

  return children;
};

const RoleGuard = ({ children, allowedRoles }) => {
  const { auth } = useCurrencies();

  if (!auth || (allowedRoles && !allowedRoles.includes(auth.role))) {
    return null;
  }

  return children;
};

export { RoleGuard, PrivateRoute };
