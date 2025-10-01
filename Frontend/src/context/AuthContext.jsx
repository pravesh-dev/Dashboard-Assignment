import { createContext, useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState("");

  // On app load, check if user is logged in via cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/profile");
        if(res.data?.user){
          setUser(res.data.user);
          setToken(true);
        }else {
          setToken(null)
        }
      } catch (err) {
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout"); // clear cookie on backend
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
    setToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, loading, user }}>
      {children}
    </AuthContext.Provider>
  );
};
