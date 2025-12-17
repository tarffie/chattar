import express, { type NextFunction, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js"; // db import
import "dotenv/config"; // Loads env
import authRoutes from "./routes/auth";
import { ZodError } from "zod";
import { AppError } from "./errors/AppError.ts";

// Connect db on startup
connectDB();
// App setup
const app = express();

// Built-in middleware to parse incoming requests as JSON
app.use(express.json());

// Bun can't handle cookie parsing by itself, this solves
app.use(cookieParser());

// Allowing requests from other services
app.use(cors({ origin: `${process.env.WEB_ORIGIN}` }));

// Routes 
app.use("/api/auth", authRoutes);

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: `${process.env.FRONTEND_ORIGIN}` },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
  // TO-DO: Emit 'user:online' or handle auth handshake
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
