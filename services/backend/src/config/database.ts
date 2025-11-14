import mongoose from "mongoose";
import "dotenv/config";

const username = process.env.MONGO_ROOT_USERNAME || "developer";
const password = process.env.MONGO_ROOT_PASSWORD || "fallback";
const database = process.env.MONGO_DATABASE || "chattar";
const host = process.env.MONGO_HOST || "mongodb";
const port = process.env.MONGO_PORT || "27017";

const uri = new URL(`mongodb://${host}:${port}/${database}`);
uri.username = username;
uri.password = password;
uri.searchParams.append("authSource", "admin");
const mongoUri = uri.toString();

console.log("Mongo URI (redacted):", mongoUri.replace(/\/\/.*@/, "//***@"));

let db: mongoose.Connection | null = null;

const connectDB = async (): Promise<typeof mongoose> => {
  if (db && db.readyState === 1) {
    // Already connected
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    db = conn.connection;
    db.on("error", (err) => console.error("DB connection error:", err));
    db.once("open", () => console.log("🗄️ MongoDB connected!"));
    return conn;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
