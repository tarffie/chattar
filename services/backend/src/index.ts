import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js'; // db import
import 'dotenv/config'; // Loads env
import authRoutes from './routes/auth';

// import { errorHandler } from "./middleware/errorHandler.js";
// import { ZodError } from "zod";
// import { AppError } from "./errors/AppError.ts";

// Connect db on startup
connectDB();
const app = express();

// Middleware callstack
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: `${process.env.WEB_ORIGIN}` }));
app.use('/api/auth', authRoutes);

import errorHandler from './middleware/errorHandler.js';
app.use(errorHandler);

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: `${process.env.FRONTEND_ORIGIN}` },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
  // TO-DO: Emit 'user:online' or handle auth handshake
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
