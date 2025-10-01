import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  return token ? children : <Navigate to="/login" />;
}
