const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { statements } = require("../db/database");
const { generateToken, authenticate } = require("../middleware/auth");

const router = express.Router();

const AVATAR_COLORS = [
  "#f59e0b", "#ef4444", "#3b82f6", "#10b981",
  "#8b5cf6", "#f97316", "#06b6d4", "#ec4899",
];

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: "Username must be 3-20 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check existing user
    const existingEmail = statements.getUserByEmail.get(email);
    if (existingEmail) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const existingUsername = statements.getUserByUsername.get(username);
    if (existingUsername) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    statements.createUser.run(userId, username, email.toLowerCase(), hashedPassword, avatarColor);

    const token = generateToken(userId);
    const user = statements.getUserById.get(userId);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = statements.getUserByEmail.get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id);
    const { password: _, ...safeUser } = user;

    res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
