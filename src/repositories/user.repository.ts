import { User } from '../models/user.model';

export const findUserByEmail = (email: string) =>
  User.findOne({ email });

export const createUser = (data: {
  email: string;
  password: string;
  role?: string;
}) => User.create(data);
