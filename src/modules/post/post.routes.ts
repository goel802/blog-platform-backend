import { Router } from 'express';
import {
  getPosts, getMyPosts, getPostById,
  createPost, updatePost, deletePost,
  addComment, deleteComment,
} from './post.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { optionalAuth }   from '../../middleware/Optionalauth.middleware';
import { allowRoles }     from '../../middleware/role.middleware';
import { upload }         from '../../middleware/upload.middleware';

const router = Router();

// ── Public ───────────────────────────────────────────────────────────────────
router.get('/', getPosts);

// ── My posts (before /:id so "mine" isn't treated as an id param)
router.get('/mine', authMiddleware, getMyPosts);

// ── Single post — optional auth lets authors preview own drafts
router.get('/:id', optionalAuth, getPostById);

// ── Create (AUTHOR or ADMIN only)
router.post('/', authMiddleware, allowRoles(['AUTHOR', 'ADMIN']), upload.single('image'), createPost);

// ── Update / Delete (ownership checked in controller)
router.patch('/:id',  authMiddleware, upload.single('image'), updatePost);
router.delete('/:id', authMiddleware, deletePost);

// ── Comments
router.post('/:id/comments',                authMiddleware, addComment);
router.delete('/:id/comments/:commentId',   authMiddleware, deleteComment);

export default router;