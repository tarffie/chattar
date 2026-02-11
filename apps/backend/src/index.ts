import express, { type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database'; // db import
import 'dotenv/config'; // Loads env
import authRoutes from './routes/auth';

const WEB_ORIGIN = process.env.WEB_ORIGIN;

// Connect db on startup
connectDB();
const app = express();

// Middleware callstack
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: WEB_ORIGIN }));

/// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use('/health', async (res: Response) => {
  res.status(200).json({ status: 'ok' });
});

import mongoose from 'mongoose';
app.use('/ready', async (res: Response) => {
  try {
    await mongoose.connection.db?.admin().ping();
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    const { message } = err as Error;
    res.status(503).json({ status: 'not ready', message });
  }
});
app.use('/api/auth', authRoutes);

import errorHandler from './middleware/errorHandler';
app.use(errorHandler);

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: WEB_ORIGIN },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
  // TO-DO: Emit 'user:online' or handle auth handshake
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
