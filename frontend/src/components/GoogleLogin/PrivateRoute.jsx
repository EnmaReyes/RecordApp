import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { useCurrencies } from "../../context/CurrencyProvider.jsx";

const PrivateRoute = ({ children, requiredRole }) => {
  const { auth } = useCurrencies();

  if (!auth) return <Navigate to="/login" />;
  if (requiredRole && auth.role !== requiredRole) return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;
