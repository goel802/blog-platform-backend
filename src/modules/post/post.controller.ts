import { Request, Response } from 'express';
import { prisma } from '../../prisma/client';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import cloudinary from '../../config/cloudinary';

// Shared Prisma include — always return author + category with every post
const POST_INCLUDE = {
  author:   { select: { id: true, name: true, email: true, role: true, createdAt: true } },
  category: true,
} as const;

// ─── GET /api/posts ──────────────────────────────────────────────────────────
// Public. Returns published posts only. Optional ?categoryId= filter.
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    const posts = await prisma.post.findMany({
      where: { published: true, ...(categoryId ? { categoryId: String(categoryId) } : {}) },
      include: POST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return res.json(posts);
  } catch (error) {
    console.error('GET POSTS ERROR:', error);
    return res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// ─── GET /api/posts/mine ─────────────────────────────────────────────────────
// Auth required. Returns all posts (incl. drafts) for the logged-in user.
// ADMINs see all posts.
export const getMyPosts = async (req: any, res: Response) => {
  try {
    const where = req.user.role === 'ADMIN' ? {} : { authorId: req.user.id };
    const posts = await prisma.post.findMany({ where, include: POST_INCLUDE, orderBy: { createdAt: 'desc' } });
    return res.json(posts);
  } catch (error) {
    console.error('GET MY POSTS ERROR:', error);
    return res.status(500).json({ message: 'Failed to fetch your posts' });
  }
};

// ─── GET /api/posts/:id ──────────────────────────────────────────────────────
// Public for published posts. Authors/admins can preview their own drafts.
export const getPostById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        ...POST_INCLUDE,
        comments: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!post.published) {
      const userId   = req.user?.id;
      const userRole = req.user?.role;
      if (!userId || (post.authorId !== userId && userRole !== 'ADMIN')) {
        return res.status(403).json({ message: 'This post is not published yet' });
      }
    }

    return res.json(post);
  } catch (error) {
    console.error('GET POST BY ID ERROR:', error);
    return res.status(500).json({ message: 'Failed to fetch post' });
  }
};

// ─── POST /api/posts ─────────────────────────────────────────────────────────
// Auth required. AUTHOR or ADMIN role.
export const createPost = async (req: any, res: Response) => {
  try {
    const { title, content, categoryId, published } = req.body;
    if (!title?.trim())   return res.status(400).json({ message: 'Title is required' });
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

    let imageUrl: string | null       = null;
    let imagePublicId: string | null  = null;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer, 'posts');
      imageUrl       = uploaded.url;
      imagePublicId  = uploaded.public_id;
    }

    const post = await prisma.post.create({
      data: {
        title:       title.trim(),
        content:     content.trim(),
        categoryId:  categoryId || null,
        authorId:    req.user.id,
        published:   published === 'true' || published === true,
        imageUrl,
        imagePublicId,
      },
      include: POST_INCLUDE,
    });

    return res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('CREATE POST ERROR:', error);
    return res.status(500).json({ message: 'Failed to create post' });
  }
};

// ─── PATCH /api/posts/:id ────────────────────────────────────────────────────
// Auth required. Only the author or an admin may update.
export const updatePost = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, published } = req.body;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    if (req.user.role !== 'ADMIN' && existing.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let imageUrl      = existing.imageUrl;
    let imagePublicId = existing.imagePublicId;

    if (req.file) {
      if (existing.imagePublicId) {
        await cloudinary.uploader.destroy(existing.imagePublicId).catch(console.error);
      }
      const uploaded = await uploadToCloudinary(req.file.buffer, 'posts');
      imageUrl       = uploaded.url;
      imagePublicId  = uploaded.public_id;
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(title      !== undefined && { title:      String(title).trim() }),
        ...(content    !== undefined && { content:    String(content).trim() }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(published  !== undefined && { published:  published === 'true' || published === true }),
        imageUrl,
        imagePublicId,
      },
      include: POST_INCLUDE,
    });

    return res.json(post);
  } catch (error) {
    console.error('UPDATE POST ERROR:', error);
    return res.status(500).json({ message: 'Failed to update post' });
  }
};

// ─── DELETE /api/posts/:id ───────────────────────────────────────────────────
// Auth required. Only the author or an admin may delete.
export const deletePost = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    if (req.user.role !== 'ADMIN' && existing.authorId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (existing.imagePublicId) {
      await cloudinary.uploader.destroy(existing.imagePublicId).catch(console.error);
    }

    // Delete comments first (FK constraint), then the post
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });

    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('DELETE POST ERROR:', error);
    return res.status(500).json({ message: 'Failed to delete post' });
  }
};

// ─── POST /api/posts/:id/comments ────────────────────────────────────────────
// Auth required. Any logged-in user can comment on published posts.
export const addComment = async (req: any, res: Response) => {
  try {
    const { id: postId } = req.params;
    const { content }    = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isPostAuthor = post.authorId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    const canCommentOnUnpublished = isPostAuthor || isAdmin;
    
    if (!post.published && !canCommentOnUnpublished) {
      return res.status(403).json({ message: 'Cannot comment on an unpublished post' });
    }

    const comment = await prisma.comment.create({
      data: { content: content.trim(), postId, userId: req.user.id },
      include: { user: { select: { id: true, name: true, role: true } } },
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error('ADD COMMENT ERROR:', error);
    return res.status(500).json({ message: 'Failed to add comment' });
  }
};

// ─── DELETE /api/posts/:id/comments/:commentId ───────────────────────────────
// Auth required. Comment owner, post author, or admin can delete.
export const deleteComment = async (req: any, res: Response) => {
  try {
    const { id: postId, commentId } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.postId !== postId) {
      return res.status(400).json({ message: 'Comment does not belong to this post' });
    }

    const isCommentOwner = comment.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isCommentOwner && !isAdmin) {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post || post.authorId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('DELETE COMMENT ERROR:', error);
    return res.status(500).json({ message: 'Failed to delete comment' });
  }
};