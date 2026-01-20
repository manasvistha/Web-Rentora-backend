import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/index.ts';

export const authorize = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  req.user = jwt.verify(token, JWT_SECRET);
  next();
};
