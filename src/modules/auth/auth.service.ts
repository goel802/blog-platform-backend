import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';

const JWT_SECRET   = process.env.JWT_SECRET!;
const JWT_EXPIRES  = '7d';

export const registerUser = async (body: { name: string; email: string; password: string }) => {
  const { name, email, password } = body;
  if (!name?.trim())       throw { status: 400, message: 'Name is required' };
  if (!email?.trim())      throw { status: 400, message: 'Email is required' };
  if (!password)           throw { status: 400, message: 'Password is required' };
  if (password.length < 6) throw { status: 400, message: 'Password must be at least 6 characters' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: 'Email is already in use' };

  const hashed = await bcrypt.hash(password, 10);
  const user   = await prisma.user.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), password: hashed },
  });

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) throw { status: 400, message: 'Email and password are required' };
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw { status: 401, message: 'Invalid email or password' };
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: 'Invalid email or password' };
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  );
};