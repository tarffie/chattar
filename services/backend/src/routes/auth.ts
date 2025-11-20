import { Router } from "express";
import {
  registerUser,
  getUserById,
  loginUser,
  updateUserKeys,
} from "../services/userService";
import jwt from "jsonwebtoken";
import { storeRefreshToken, getRefreshToken } from "../services/tokenService";

const router = Router();

router.get("/health", (req, res) =>
  res.json({ ok: true, message: "the authentication api is working properly" }),
);

router.get("/me", async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey,
      },
    });
  } catch (error) {
    // fallback when not authenticated
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    const { message } = error as Error;
    return res.status(401).json({ error: message });
  }
});

router.post("/add-device-key", async (req, res) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: "Public key is required" });
    }

    await updateUserKeys(decoded.userId, publicKey);

    return res.status(200).json({ success: true });
  } catch (error) {
    const { message } = error as Error;
    console.error("Add device key error:", message); // Log for debugging

    if (message.includes("jwt")) {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(500).json({ error: "Failed to add device key" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Invalid token type" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const storedToken = await getRefreshToken(refreshToken);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

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
