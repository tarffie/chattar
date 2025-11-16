import { Router } from "express";
import { registerUser, findUser, loginUser } from "../services/userService";
import jwt from "jsonwebtoken";
import { storeRefreshToken } from "../services/tokenService";

const router = Router();

router.get("/health", (req, res) =>
  res.json({ ok: true, message: "the authentication api is working properly" }),
);

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
      const accessToken = jwt.sign(
        { userId: result.user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" },
      );

      const refreshToken = jwt.sign(
        { userId: result.user.id, type: "refresh" },
        process.env.JWT_SECRET!,
        { expiresIn: "90d" },
      );

      await storeRefreshToken({
        userId: result.user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip,
      });

      res.cookie("acessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });

      return res.status(201).json({ user: result.user });
    }
  } catch (error) {
    const { message } = error as Error;
    console.error("Register error:", message); // Log to Loki later
    res.status(400).json({ error: message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { identification, password } = req.body;

    if (!identification || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await loginUser({
      username: identification,
      password,
    });
    if (result.success == true) {
      const accessToken = jwt.sign(
        { userId: result.user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" },
      );

      const refreshToken = jwt.sign(
        { userId: result.user.id, type: "refresh" },
        process.env.JWT_SECRET!,
        { expiresIn: "90d" },
      );

      await storeRefreshToken({
        userId: result.user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });

      return res.status(200).json({ user: result.user });
    }
  } catch (error) {
    const { message } = error as Error;
    console.error("Authentication error:", message); // Log to Loki later
    res.status(400).json({ error: message });
  }
});

export default router;
