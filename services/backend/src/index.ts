import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';  // Loads .env

// Your Mongo URI construction here (from earlier response)
const username = process.env.MONGO_ROOT_USERNAME || 'developer';
const password = process.env.MONGO_ROOT_PASSWORD || 'fallback';
const database = process.env.MONGO_DATABASE || 'chattar';
const host = process.env.MONGO_HOST || 'mongodb';
const port = process.env.MONGO_PORT || '27017';

const uri = new URL(`mongodb://${host}:${port}/${database}`);
uri.username = username;
uri.password = password;
uri.searchParams.append('authSource', 'admin');
const mongoUri = uri.toString();

console.log('Mongo URI (redacted):', mongoUri.replace(/\/\/.*@/, '//***@'));

// App setup
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Basic route
app.get('/', (req, res) => res.send('Chattar Backend Live!'));

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(4000, () => console.log('🚀 Server on 4000'));
