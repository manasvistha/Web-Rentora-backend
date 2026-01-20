import { UserModel, IUser } from "../models/user.model.ts";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username });
  }
}
