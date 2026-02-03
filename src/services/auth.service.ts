import { UserModel } from "../models/user.model";
import jwt from "jsonwebtoken";

export class AuthService {
  async login(data: any) {
    const email = (data?.email || "").trim().toLowerCase();
    const password = data?.password;

    // 1. Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error("Invalid credentials"); // Email not found
    }

    // 2. Compare password using the method in our Model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials"); // Password wrong
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "30d" }
    );

    // 4. Return keys that match what our Controller and Flutter expect
    return {
      user: user.toJSON(), // Converts _id to id and hides password
      token,
    };
  }

  async register(data: any) {
    const payload = {
      ...data,
      email: (data?.email || "").trim().toLowerCase(),
      username: data?.username ? data.username.trim().toLowerCase() : undefined,
    };

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: payload.email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create user (password is hashed automatically by our Model's pre-save hook)
    const user = await UserModel.create(payload);
    return user;
  }

  async getUserById(userId: string) {
    // Find user by ID and exclude password
    const user = await UserModel.findById(userId).select("-password");
    return user ? user.toJSON() : null;
  }

  async updateProfilePicture(userId: string, photoUrl: string) {
    // Update user's profilePicture field
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { profilePicture: photoUrl },
      { new: true } // Return the updated document
    ).select("-password");
    
    return user ? user.toJSON() : null;
  }
}