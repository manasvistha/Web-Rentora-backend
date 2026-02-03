import { Request, Response } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class AdminController {
  async createUser(req: Request, res: Response) {
    try {
      const file = (req as any).file;

      // Validate required fields
      if (!req.body?.name || !req.body?.email || !req.body?.password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        });
      }

      const userData: any = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        username: req.body.username || undefined,
        role: req.body.role || "user",
      };

      if (file) {
        userData.profilePicture = `/public/profile-pictures/${file.filename}`;
      }

      const user = await userService.createUser(userData);

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Failed to create user",
        });
      }

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Admin create user error:", error.message);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create user",
      });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get users",
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await userService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: user, // Service already serializes - no .toJSON() call
      });
    } catch (error: any) {
      console.error("Error fetching user by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get user",
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const file = (req as any).file;

      const updateData: any = {
        name: req.body?.name,
        email: req.body?.email,
        password: req.body?.password,
        username: req.body?.username,
        role: req.body?.role,
      };

      if (file) {
        updateData.profilePicture = `/public/profile-pictures/${file.filename}`;
      }

      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined || updateData[key] === "") {
          delete updateData[key];
        }
      });

      const user = await userService.updateUserById(userId, updateData);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update user",
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const user = await userService.deleteUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: user,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete user",
      });
    }
  }
}
