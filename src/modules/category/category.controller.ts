import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import slugify from 'slugify';

// POST /api/categories  (ADMIN only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });

    const slug     = slugify(name.trim(), { lower: true, strict: true });
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return res.status(409).json({ message: 'Category already exists' });

    const category = await prisma.category.create({ data: { name: name.trim(), slug } });
    return res.status(201).json(category);
  } catch (error) {
    console.error('CREATE CATEGORY ERROR:', error);
    return res.status(500).json({ message: 'Failed to create category' });
  }
};

// GET /api/categories  (public)
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return res.json(categories);
  } catch (error) {
    console.error('GET CATEGORIES ERROR:', error);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// DELETE /api/categories/:id  (ADMIN only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id }   = req.params;
    const existing = await prisma.category.findUnique({ where: { id: id as string } });
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    // Unlink posts before deleting
    await prisma.post.updateMany({ where: { categoryId: id as string }, data: { categoryId: null } });
    await prisma.category.delete({ where: { id: id as string } });
    return res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('DELETE CATEGORY ERROR:', error);
    return res.status(500).json({ message: 'Failed to delete category' });
  }
};