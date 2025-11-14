import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js"; // DB import
import "dotenv/config"; // Loads .env

// Connect DB on startup
connectDB();

// App setup
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => res.send("Chattar Backend Live!"));

import authRoutes from './routes/auth'
app.use('/api/auth', authRoutes);

// TODO: Import and use routes, e.g.:
// import authRoutes from './routes/auth.js';
// app.use('/api/auth', authRoutes);

// Socket.io (basic for now; add auth later)
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
  // TODO: Emit 'user:online' or handle auth handshake
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
