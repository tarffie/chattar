import { Router, type Response } from 'express';
import { registerUser, getUserById, loginUser, updateUserKeys } from '../services/userService';
import jwt from 'jsonwebtoken';
import { storeRefreshToken, getRefreshToken } from '../services/tokenService';
import { AppError, ValidatorError } from '../errors/AppError';

const router = Router();

// Route to check if API is alive
router.get('/health', (res: Response) => {
  res.json({ ok: true, message: 'the authentication api is working properly' });
});

/**
 * Auxiliary route used by frontend home and define
 * if they show the dashboard or the landing page
 */
router.get('/me', async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new ValidatorError('Not authenticated');
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await getUserById(decoded.userId);

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    return res
      .status(200)
      .json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          publicKey: user.publicKey,
        },
      })
      .send();
  } catch (err) {
    next(err);
  }
});

/**
 * Route to certificate and remember the device on which the user is logged
 */
router.post('/add-device-key', async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new ValidatorError('Not authenticated');
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const { publicKey } = req.body;

    if (!publicKey) {
      throw new ValidatorError('Public key is required');
    }

    await updateUserKeys(decoded.userId, publicKey);
    return res.status(200).json({ success: true }).send();
  } catch (err) {
    next(err);
  }
});

/**
 * Route to refresh user token if valid and he's already authenticated
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return new ValidatorError('Invalid token type');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const storedToken = await getRefreshToken(refreshToken);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new ValidatorError('Invalid or expired refresh token');
    }

    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    return res.status(200).json({ success: true }).send();
  } catch (err) {
    next(err);
  }
});

/**
 * Register endpoint
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, password: password, email, publicKey } = req.body;

    if (!username || !password || !email || !publicKey) {
      throw new ValidatorError('Missing Fields');
      // return res.status(422).json({ error: "Missing fields" }).send();
    }

    const result = await registerUser({
      username: username,
      password: password,
      email: email,
      publicKey: publicKey,
    });

    if (result.success) {
      const accessToken = jwt.sign({ userId: result.data.id }, process.env.JWT_SECRET!, {
        expiresIn: '15m',
      });

      const refreshToken = jwt.sign(
        { userId: result.data.id, type: 'refresh' },
        process.env.JWT_SECRET!,
        { expiresIn: '90d' },
      );

      await storeRefreshToken({
        userId: result.data.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });

      return res.status(201).json({ user: result.data }).send();
    }
    throw new AppError(404, result.error.message);
  } catch (err) {
    next(err);
  }
});

/**
 * Login endpoint
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email.length || !password.length) {
      throw new ValidatorError('Missing Fields');
    }

    const result = await loginUser({
      email: email,
      password,
    });

    if (result.success) {
      const accessToken = jwt.sign({ userId: result.data._id }, process.env.JWT_SECRET!, {
        expiresIn: '15m',
      });

      const refreshToken = jwt.sign(
        { userId: result.data._id, type: 'refresh' },
        process.env.JWT_SECRET!,
        { expiresIn: '90d' },
      );

      await storeRefreshToken({
        userId: result.data._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });

      return res.status(200).json({ user: result.data }).send();
    }
    throw new ValidatorError(result.error.message);
  } catch (err) {
    next(err);
  }
});

export default router;
