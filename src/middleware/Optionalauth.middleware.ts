import jwt from 'jsonwebtoken';

export const optionalAuth = (req: any, _res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET!); }
    catch { /* invalid/expired — continue as anonymous */ }
  }
  next();
};