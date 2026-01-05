import { Request, Response } from 'express';
import { registerDto, loginDto } from '../dtos/user.dto';
import { registerUser, loginUser } from '../services/user.service';

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerDto.parse(req.body);
    const user = await registerUser(data.email, data.password);
    res.status(201).json({ email: user.email, role: user.role });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginDto.parse(req.body);
    const token = await loginUser(data.email, data.password);
    res.json({ token });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};
