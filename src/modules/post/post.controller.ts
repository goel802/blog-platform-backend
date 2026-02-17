import { prisma } from '../../prisma/client';
import { Request, Response } from "express";
// import { prisma } from "../../prisma/client";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";



export const createPost = async (req: any, res: Response) => {
  try {
    const { title, content, categoryId } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    // Upload image if exists
    if (req.file) {
      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "posts"
      );

      imageUrl = uploaded.url;
      imagePublicId = uploaded.public_id;
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        categoryId: categoryId || null,
        authorId: req.user.id, // from auth middleware
        imageUrl,
        imagePublicId,
      },
    });

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });

  } catch (error) {
    console.error("CREATE POST ERROR:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to create post",
      });
    }
  }
};



export const getPosts = async (_req: any, res: any) => {
const posts = await prisma.post.findMany({ where: { published: true } });
res.json(posts);
};