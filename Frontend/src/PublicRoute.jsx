import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  // If user is logged in, redirect to dashboard
  if (token) return <Navigate to="/dashboard" />;

  // Otherwise, show the requested public page (login/signup)
  return children;
};

export default PublicRoute;
