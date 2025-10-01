import { useState, useContext } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Validations for login form
const validateLoginForm = (form) => {
  if (!form.email.trim() || !form.password.trim()) {
    return "Email and password are required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    return "Please enter a valid email address.";
  }

  return null; // No errors
};

export default function Login() {
const { setToken } = useContext(AuthContext)
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const validationError = validateLoginForm(form);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      await api.post("/auth/login", form);
    setToken(true);
    navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="bg-[#0C1017] border border-white/20 w-[19rem] md:w-96 py-10 px-3 md:px-10 shadow rounded-lg flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white">Login</h1>
        {error && (
          <p className="text-red-500 text-sm mb-3 mt-2 text-center">{error}</p>
        )}
        <label htmlFor="email" className="text-white/70 text-xs w-full mb-2 mt-2">Email*</label>
        <input className="text-white text-sm bg-[#05070A] w-full h-10 rounded-md border-none outline-none px-4" type="email" id="email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label htmlFor="password" className="text-white/70 text-xs w-full mb-2 mt-2">Password*</label>
        <input className="text-white text-sm bg-[#05070A] w-full h-10 rounded-md border-none outline-none px-4" type="password" id="password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full bg-white cursor-pointer text-black font-semibold rounded-md px-4 py-2 mt-6">Login</button>
        <p className="mt-4 text-center text-sm text-white">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Click here
          </span>
        </p>
      </form>
    </div>
  );
}
