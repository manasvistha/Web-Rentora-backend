import { UserModel } from "../models/user.model";
import bcrypt from "bcryptjs";

export class UserService {
  async createUser(data: any) {
    if (data?.email) {
      const existingUser = await UserModel.findOne({ email: data.email });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }
    }

    const user = await UserModel.create(data);
    return user ? user.toJSON() : null;
  }

  async getAllUsers() {
    const users = await UserModel.find().select("-password");
    return users.map((user) => (user.toJSON ? user.toJSON() : user));
  }

  async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select("-password");
    return user ? user.toJSON() : null;
  }

  async updateUserById(userId: string, data: any) {
    const updateData = { ...data };

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const user = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    return user ? user.toJSON() : null;
  }

  async deleteUserById(userId: string) {
    const user = await UserModel.findByIdAndDelete(userId).select("-password");
    return user ? user.toJSON() : null;
  }
}
