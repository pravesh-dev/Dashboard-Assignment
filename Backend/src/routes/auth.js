import express from "express";
import { register, login, logout, getProfile, updateProfile, addTask, getTasks, editTask, deleteTask } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.get("/tasks", authMiddleware, getTasks)
router.post("/tasks", authMiddleware, addTask)
router.put("/tasks/:id", authMiddleware, editTask)
router.delete("/tasks/:id", authMiddleware, deleteTask);

export default router;
