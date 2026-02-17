import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import slugify from 'slugify';

export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;

  const category = await prisma.category.create({
    data: {
      name,
      slug: slugify(name, { lower: true }),
    },
  });

  res.status(201).json(category);
};

export const getCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  res.json(categories);
};
