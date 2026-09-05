import express, { type Response, type Request } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database'; // db import
import 'dotenv/config'; // Loads env
import authRoutes from './routes/auth';
import process from 'process';
import console from 'console';

if (!process.env.WEB_ORIGIN) {
  throw new Error('Error handling internal values');
}

const WEB_ORIGIN = process.env.WEB_ORIGIN;

// Connect db on startup
connectDB();

// App initiliazition
const app = express();

// Middleware callstack
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [WEB_ORIGIN, 'http://chattar.homelab'],
  }),
);

app.get('/health', async (_req: Request, _res: Response) => {
  _res.status(200).json({ status: 'ok' });
});

app.post('/publichelper', async (_req: Request, _res: Response) => {
  console.log('entered the route');
  _res.status(200).json({ status: 'ok', message: 'hello from inside this bullshit route' });
});

import mongoose from 'mongoose';
app.get('/ready', async (_req: Request, _res: Response) => {
  try {
    await mongoose.connection.db?.admin().ping();
    _res.status(200).json({ status: 'ready' });
  } catch (err) {
    const { message } = err as Error;
    _res.status(503).json({ status: 'not ready', message });
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
