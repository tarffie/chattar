import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js"; // DB import
import "dotenv/config"; // Loads .env
import authRoutes from "./routes/auth";
import { errorHandler } from './middleware/errorHandler.ts'

// Connect DB on startup
connectDB();
// App setup
const app = express();

app.use(cookieParser()); // Bun can't handle cookie parsing by itself, this solves
app.use(cors({ origin: `${process.env.FRONTEND_ORIGIN}` })); // Enabling cross origin cors so our frontend can fetch the api
app.use(express.json()); // built-in middleware to parse incoming requets as json
app.use("/api/auth", authRoutes);
app.use(errorHandler);

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: `${process.env.FRONTEND_ORIGIN}` },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
  // TODO: Emit 'user:online' or handle auth handshake
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server on ${PORT}`));
