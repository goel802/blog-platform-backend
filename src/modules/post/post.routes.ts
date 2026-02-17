import { Router } from 'express';
import { createPost, getPosts } from './post.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { allowRoles } from '../../middleware/role.middleware';

import { upload } from '../../middleware/upload.middleware';


const router = Router();


router.get('/', getPosts);
router.post('/', authMiddleware, allowRoles(['ADMIN','AUTHOR']), upload.single("image"), createPost);


export default router;