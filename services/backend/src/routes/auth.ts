import { Router } from "express";
import { registerUser } from "../services/userService";
import jwt from 'jsonwebtoken'; // For token later

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password: informedPassword, email, publicKey } = req.body;

    // Basic input check (service does deep validation)
    if (!username || !informedPassword || !email || !publicKey) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await registerUser({
      username,
      informedPassword,
      email,
      publicKey,
    });

    if (result.success) {
      // Generate JWT (stub—add secret from .env)
      const token = jwt.sign(
        { userId: result.user.id },
        process.env.JWT_SECRET || "fallback",
      );
      return res.status(201).json({ user: result.user, token });
    }
  } catch (error) {
    const { message } = error as Error;
    console.error("Register error:", message); // Log to Loki later
    res.status(400).json({ error: message });
  }
});

export default router;
