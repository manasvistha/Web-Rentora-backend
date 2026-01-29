import mongoose from "mongoose";
import { MONGO_URI } from "../config/index"; // Remove .ts extension in imports

export async function connectDB() {
  try {
    // Set strictQuery to prepare for Mongoose 7/8 changes
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected (Rentora)");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    // Exit process with failure
    process.exit(1);
  }
}