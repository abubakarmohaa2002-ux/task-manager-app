import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// ✅ AUTH ROUTES

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

export default router;