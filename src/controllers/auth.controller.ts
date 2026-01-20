import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { registerDTO, loginDTO } from "../dtos/user.dto";

const authService = new AuthService();

export class AuthController {
  // src/controllers/auth.controller.ts
  async register(req: Request, res: Response) {
    try {
      // 1. Validate incoming data with Zod
      const validatedData = registerDTO.parse(req.body);
      
      // 2. Call service to create user
      const user = await authService.register(validatedData);
      
      // 3. Return response - Flutter looks for 'success' and 'user'
      return res.status(201).json({ 
        success: true,
        message: "Registration successful", 
        user // Matching: response.data['user'] in Flutter register()
      });
    } catch (error: any) {
      console.error("Registration Error Details:", error.errors || error.message); 
      
      return res.status(400).json({ 
        success: false,
        // Send a readable message for the Flutter UI
        message: error.errors ? error.errors[0].message : error.message,
        error: error.errors || error.message 
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // 1. Validate credentials
      const validatedData = loginDTO.parse(req.body);
      
      // 2. Perform login via service
      const result = await authService.login(validatedData);
      
      // 3. Return response - Flutter looks for 'token' and 'data'
      // result should be { user: IUser, token: string }
      return res.status(200).json({
        success: true,
        token: result.token, // Matching: response.data['token'] in Flutter login()
        data: result.user    // Matching: response.data['data'] in Flutter login()
      });
    } catch (error: any) {
      console.error("Login Error Details:", error.message);
      
      return res.status(401).json({ 
        success: false,
        message: error.message || "Login failed",
        error: error.message 
      });
    }
  }

  // Get current user profile (protected route)
  async getProfile(req: Request, res: Response) {
    try {
      // User is attached to req by the authorize middleware
      const userId = (req as any).user.id;
      
      const user = await authService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      console.error("Get Profile Error:", error.message);
      
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get profile"
      });
    }
  }
}