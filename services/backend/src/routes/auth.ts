import { AppError } from "../errors/AppError";
import { Router, type Response } from "express";
import {
  registerUser,
  getUserById,
  loginUser,
  updateUserKeys,
} from "../services/userService";
import jwt from "jsonwebtoken";
import { storeRefreshToken, getRefreshToken } from "../services/tokenService";

const router = Router();

// Route to check if API is alive
router.get("/health", (res: Response) => {
  res.json({ ok: true, message: "the authentication api is working properly" })
});

/**
 * Auxiliary route used by frontend home and define
 * if they show the dashboard or the landing page
 */
router.get("/me", async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    res.status(401).json({ error: "Not authenticated" }).send();
  }

  const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
    userId: string;
  };

  const user = await getUserById(decoded.userId);

  if (!user) {
    return res.status(401).json({ error: "User not found" }).send();
  }

  return res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      publicKey: user.publicKey,
    },
  }).send();
});

/**
 * Route to certificate and remember the device on which the user is logged
 */
router.post("/add-device-key", async (req, res) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ error: "Not authenticated" }).send();
  }

  const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
    userId: string;
  };

  const { publicKey } = req.body;

  if (!publicKey) {
    return res.status(400).json({ error: "Public key is required" }).send();
  }

  await updateUserKeys(decoded.userId, publicKey);
  return res.status(200).json({ success: true }).send();
});

/**
 * Route to refresh user token if valid and he's already authenticated
 */
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Invalid token type" }).send();
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
    userId: string;
  };

  const storedToken = await getRefreshToken(refreshToken);

  if (!storedToken || storedToken.expiresAt < new Date()) {
    return res
      .status(401)
      .json({ error: "Invalid or expired refresh token" }).send();
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
  return res.status(200).json({ success: true }).send();
});

/**
 * Register endpoint 
 */
router.post("/register", async (req, res) => {
  const { username, password: password, email, publicKey } = req.body;

  // Basic input check (service does deep validation)
  if (!username || !password || !email || !publicKey) {
    return res.status(400).json({ error: "Missing fields" }).send();
  }

  const result = await registerUser({
    username: username,
    password: password,
    email: email,
    publicKey: publicKey,
  });

  const failed = !!(result instanceof Error);

  if (!failed) {
    const accessToken = jwt.sign(
      { userId: result.data.id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: result.data.id, type: "refresh" },
      process.env.JWT_SECRET!,
      { expiresIn: "90d" },
    );

    await storeRefreshToken({
      userId: result.data.id,
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

    return res.status(201).json({ user: result.data }).send();
  }

  return res.status(404).json({ error: result }).send();
});

/**
 * Login endpoint
 */
router.post("/login", async (req, res, next) => {
  const { identification, password } = req.body;

  if (!identification || !password) {
    next(new AppError(422, "Missing fields"))
  }

  const result = await loginUser({
    username: identification,
    password,
  });

  const failed = !!(result instanceof Error)

  if (!failed) {
    const accessToken = jwt.sign(
      { userId: result.user.data._id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { userId: result.user.data._id, type: "refresh" },
      process.env.JWT_SECRET!,
      { expiresIn: "90d" },
    );

    await storeRefreshToken({
      userId: result.user.data.id,
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

    return res.status(200).json({ user: result.user.data }).send();
  }

  return res.status(400).json({ error: result.message })
});

export default router;
