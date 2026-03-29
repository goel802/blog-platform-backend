import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes     from './modules/auth/auth.routes';
import postRoutes     from './modules/post/post.routes';
import categoryRoutes from './modules/category/category.routes';
import imageRoutes    from './modules/image/image.routes';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => { console.log(`${new Date().toISOString()} ${req.method} ${req.url}`); next(); });

app.use('/api/auth',       authRoutes);
app.use('/api/posts',      postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/images',     imageRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('UNHANDLED ERROR:', err);
  res.status(err.status ?? 500).json({ message: err.message ?? 'Internal server error' });
});

app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
export default app;