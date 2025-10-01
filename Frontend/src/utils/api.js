import axios from "axios";

const api = axios.create({
  baseURL: "https://dashboard-assignment-backend-0894.onrender.com/api",
  withCredentials: true,
});

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("dashAuthToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default api;
