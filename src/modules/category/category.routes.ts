import { Router } from 'express';
import { createCategory, getCategories, deleteCategory } from './category.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { allowRoles }     from '../../middleware/role.middleware';

const router = Router();

router.get('/',     getCategories);
router.post('/',    authMiddleware, allowRoles(['ADMIN']), createCategory);
router.delete('/:id', authMiddleware, allowRoles(['ADMIN']), deleteCategory);

export default router;