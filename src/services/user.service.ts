import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../repositories/user.repository';
import { config } from '../config';

export const registerUser = async (email: string, password: string) => {
  const exists = await findUserByEmail(email);
  if (exists) throw new Error('User already exists');

  const hashed = await bcrypt.hash(password, 10);
  return createUser({ email, password: hashed });
};

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');

  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: '1d' }
  );
};
