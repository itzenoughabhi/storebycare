import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load variables from .env

const uri = process.env.MONGODB_URI;

async function run() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully!");
    
    // Optional: close connection after test
    await mongoose.connection.close();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

run();
