import { Request, Response } from "express";
import prisma from "../config/prisma";

// Creating post
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, mediaUrls, hashTags, subCommunityId } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const author = req.user;
    if (!author) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const authorId = author.id;
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorid: authorId,
        ...(mediaUrls && { mediaurls: mediaUrls }),
        ...(hashTags && { hashtags: hashTags }),
        ...(subCommunityId && { subcommunityid: subCommunityId }),
      },
    });
    if (!post) {
      return res.status(500).json({ error: "Failed to created post" });
    }
    return res.status(201).json({ message: "Post created", post });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Getting all posts (#pagination required)
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany();
    if (!posts || !posts.length) {
      return res.status(404).json({ error: "No posts found" });
    }
    return res
      .status(200)
      .json({ message: `${posts.length} Posts found`, posts });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get single post
export const getSinglePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.postId;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json({ message: "Post found", post });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { title, content, mediaUrls, hashTags } = req.body;
    const id = req.params.postId;
    const currentUser = req.user;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (
      post.authorid !== currentUser?.id &&
      currentUser?.role !== "MODERATOR" &&
      currentUser?.role !== "ADMIN" &&
      currentUser?.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({ error: "You cannot edit this post" });
    }
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(mediaUrls && { mediaurls: mediaUrls }),
        ...(hashTags && { hashtags: hashTags }),
      },
    });
    if (!updatedPost) {
      return res.status(500).json({ error: "Failed to update post" });
    }
    return res.status(200).json({ message: "Post updated", updatedPost });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.postId;
    const currentUser = req.user;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (
      post.authorid !== currentUser?.id &&
      currentUser?.role !== "MODERATOR" &&
      currentUser?.role !== "ADMIN" &&
      currentUser?.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({ error: "You cannot delete this post" });
    }
    const deleted = await prisma.post.delete({ where: { id } });
    if (!deleted) {
      return res.status(500).json({ error: "Failed to delete post" });
    }
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
