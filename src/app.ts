import express from 'express';
import  cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import postRoutes from './modules/post/post.routes';
import { logger } from './middleware/logger';
import categoryRoutes from './modules/category/category.routes';
import imageRoutes from './modules/image/image.routes';



const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);
console.log('IMAGE ROUTES REGISTERED');
app.use('/api/images', imageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

app.get("/health", (req:any, res:any) => {
  res.send("OK");
});


export default app;