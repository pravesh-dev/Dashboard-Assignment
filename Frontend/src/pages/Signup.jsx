import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Validations for Signup form
const validateSignupForm = (form) => {
  if (!form.email.trim() || !form.password.trim() || !form.confirmPassword.trim()) {
    return "Email, password, and confirm password are required.";
  }

  if (form.password !== form.confirmPassword) {
    return "Passwords do not match.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    return "Please enter a valid email address.";
  }

  if (form.password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (/\s/.test(form.password) || /\./.test(form.password)) {
    return "Password cannot contain spaces or dots.";
  }

  const hasUppercase = /[A-Z]/.test(form.password);
  const hasLowercase = /[a-z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(form.password);

  if (!hasUppercase) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!hasLowercase) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!hasNumber) {
    return "Password must contain at least one number.";
  }
  if (!hasSpecialChar) {
    return "Password must contain at least one special symbol.";
  }

  return null; // No errors
};

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateSignupForm(form);
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      // Only send username, email, and password to the API
      const { username, email, password } = form;
      await api.post("/auth/signup", { username, email, password });
      navigate("/login"); // after signup, redirect to login
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again later.");
      setTimeout(() => {
        setError("")
      }, 3000);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0C1017] border border-white/20 w-[19rem] md:w-96 py-10 px-3 md:px-10 shadow rounded-lg flex flex-col items-center text-white"
      >
        <h2 className="text-2xl font-bold text-white">Sign Up</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 mt-2 text-center">{error}</p>
        )}
        <label htmlFor="username" className="text-white/70 text-xs w-full mb-2 mt-2">Username*</label>
        <input
          type="text"
          id="username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="text-white text-sm bg-[#05070A] w-full h-10 rounded-md border-none outline-none px-4"
          required
        />
        <label htmlFor="email" className="text-white/70 text-xs w-full mb-2 mt-2">Email*</label>
        <input
          type="email"
          id="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="text-white text-sm bg-[#05070A] w-full h-10 rounded-md border-none outline-none px-4"
        />
        <label htmlFor="password" className="text-white/70 text-xs w-full mb-2 mt-2">Password*</label>
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"} // Dynamically change type
            id="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="text-white text-sm bg-[#05070A] w-full h-10 rounded-md border-none outline-none px-4 pr-10"
          />
          <span
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
          >
            {showPassword ? (
              <FaEyeSlash className="text-white/70" />
            ) : (
              <FaEye className="text-white/70" />
            )}
          </span>
        </div>

        <label htmlFor="confirmPassword" className="text-white/70 text-xs w-full mb-2 mt-2">Confirm Password*</label>
        <div className="relative w-full">
          <input
            type={showConfirmPassword ? "text" : "password"} // Dynamically change type
            id="confirmPassword"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="text-white text-sm bg-[#05070A] w-full h-10 rounded-md border-none outline-none px-4 pr-10"
          />
          <span
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle confirm password visibility
          >
            {showConfirmPassword ? (
              <FaEyeSlash className="text-white/70" />
            ) : (
              <FaEye className="text-white/70" />
            )}
          </span>
        </div>

        <button
          type="submit"
          className="w-full bg-white text-black cursor-pointer font-semibold rounded-md px-4 py-2 mt-6"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
