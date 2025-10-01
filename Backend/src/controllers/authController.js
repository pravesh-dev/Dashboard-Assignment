import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Task from "../models/Task.js";

// Helper function for email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function for password validation (for registration)
const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (/\s/.test(password) || /\./.test(password)) {
    return "Password cannot contain spaces or dots.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "Password must contain at least one special symbol.";
  }
  return null; // Password is valid
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input presence
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Username, email, and password are required." });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Registration Failed" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { password, email } = req.body;

  // Validate input presence
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address." });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.json({ message: "Login Successull", success: true });
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email, mobileNumber } = req.body;
    const userId = req.user._id;
    const currentUser = req.user;

    const updateFields = {};
    let changesMade = false;

    // Update username if provided and different from current
    if (username !== undefined && username.trim() !== currentUser.username) {
      if (typeof username !== 'string' || username.trim() === '') {
        return res.status(400).json({ error: "Username cannot be empty." });
      }
      updateFields.username = username.trim();
      changesMade = true;
    }

    // Update mobileNumber if provided and different from current
    // Normalize empty string to null for consistent storage and comparison
    const newMobileNumber = (mobileNumber === '' || mobileNumber === null) ? null : mobileNumber;
    const currentMobileNumber = (currentUser.mobileNumber === '' || currentUser.mobileNumber === null) ? null : currentUser.mobileNumber;

    if (newMobileNumber !== undefined && newMobileNumber !== currentMobileNumber) {
      if (newMobileNumber !== null && typeof newMobileNumber !== 'string') {
        return res.status(400).json({ error: "Mobile number must be a string or null." });
      }
      updateFields.mobileNumber = newMobileNumber;
      changesMade = true;
    }

    // Update email if provided and different from current
    if (email !== undefined && email.toLowerCase() !== currentUser.email.toLowerCase()) {
      if (typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ error: "Email cannot be empty." });
      }
      if (!validateEmail(email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
      }

      // Check for email uniqueness only if the email is actually changing
      const existingUserWithEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId.toString()) {
        return res.status(400).json({ error: "This email is already registered by another user." });
      }
      updateFields.email = email.toLowerCase();
      changesMade = true;
    }

    // If no actual changes were detected, return current profile with a message
    if (!changesMade) {
      return res.status(200).json({ message: "No changes detected.", user: currentUser });
    }

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true, select: '-password' } // Return the updated document, run schema validators, exclude password
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "Profile updated successfully!", user: updatedUser });

  } catch (error) {
    console.error("Error updating profile:", error);
    // Handle specific Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update profile." });
  }
}

export const getTasks = async (req, res) => {
  try {
    const allTasks = await Task.find({ userId: req.user._id });
    res.status(200).json(allTasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
};

export const addTask = async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required." });
  }

  try {
    const newTask = await Task.create({
      title,
      description,
      userId: req.user._id,
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task." });
  }
};

export const editTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, isCompleted } = req.body;

  try {
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, description, isCompleted },
      { new: true } // return updated document
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found or unauthorized." });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task." });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the task and ensure it belongs to the authenticated user
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ error: "Task not found or unauthorized." });
    }

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task." });
  }
};
