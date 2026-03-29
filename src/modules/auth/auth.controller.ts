import { Request, Response } from 'express';
import * as service from './auth.service';

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const token = await service.registerUser(req.body);
    return res.status(201).json({ token });
  } catch (err: any) {
    return res.status(err.status ?? 500).json({ message: err.message ?? 'Registration failed' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const token = await service.loginUser(req.body.email, req.body.password);
    return res.json({ token });
  } catch (err: any) {
    return res.status(err.status ?? 500).json({ message: err.message ?? 'Login failed' });
  }
};