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

// Vote toggle (upvote/downvote)
export const voteToggle = async (req: Request, res: Response) => {
  try {
    const voteType = req.body.voteType as "UPVOTE" | "DOWNVOTE";
    const id = req.params.postId;
    const currentUser = req.user;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const vote = await prisma.$transaction(async (tx) => {
      const existingVote = await tx.vote.findFirst({
        where: {
          postid: id,
          userid: currentUser?.id,
        },
      });

      const post = await tx.post.findUnique({
        where: { id },
        select: { authorid: true, upvotecount: true, downvotecount: true },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      let message = "";
      let updatedVote = null;
      let newVote = null;

      // --- CASE 1: Remove existing same-type vote (toggle off)
      if (existingVote && existingVote.votetype === voteType) {
        await tx.vote.delete({ where: { id: existingVote.id } });

        const updateField =
          voteType === "UPVOTE"
            ? { upvotecount: { decrement: 1 } }
            : { downvotecount: { decrement: 1 } };

        const updatedPost = await tx.post.update({
          where: { id },
          data: updateField,
          select: { id: true, upvotecount: true, downvotecount: true },
        });

        message = "Vote removed";

        return {
          message,
          post: updatedPost,
        };
      }

      // --- CASE 2: Switch vote type (e.g., upvote → downvote)
      if (existingVote && existingVote.votetype !== voteType) {
        updatedVote = await tx.vote.update({
          where: { id: existingVote.id },
          data: { votetype: voteType },
        });

        const data =
          voteType === "UPVOTE"
            ? {
                upvotecount: { increment: 1 },
                downvotecount: { decrement: 1 },
              }
            : {
                downvotecount: { increment: 1 },
                upvotecount: { decrement: 1 },
              };

        const updatedPost = await tx.post.update({
          where: { id },
          data,
          select: { id: true, upvotecount: true, downvotecount: true },
        });

        // Create notification (if not own post)
        if (post.authorid !== currentUser?.id) {
          await tx.notification.create({
            data: {
              userid: post.authorid,
              type: `${voteType}`,
              content: `${currentUser?.username} changed their vote on your post to ${voteType}.`,
              relatedentityid: id,
            },
          });
        }

        message = "Vote updated";

        return {
          message,
          vote: updatedVote,
          post: updatedPost,
        };
      }

      // --- CASE 3: New vote
      newVote = await tx.vote.create({
        data: {
          postid: id,
          userid: currentUser?.id!,
          votetype: voteType,
        },
      });

      const updateField =
        voteType === "UPVOTE"
          ? { upvotecount: { increment: 1 } }
          : { downvotecount: { increment: 1 } };

      const updatedPost = await tx.post.update({
        where: { id },
        data: updateField,
        select: { id: true, upvotecount: true, downvotecount: true },
      });

      // Create notification (if not voting on own post)
      if (post.authorid !== currentUser?.id) {
        await tx.notification.create({
          data: {
            userid: post.authorid,
            type: `${voteType}`,
            content: `${
              currentUser?.username
            } ${voteType.toLowerCase()}d your post.`,
            relatedentityid: id,
          },
        });
      }

      message = "Vote added";

      return {
        message,
        vote: newVote,
        post: updatedPost,
      };
    });

    if (!vote) {
      return res.status(500).json({ error: "Failed to process vote" });
    }
    return res.status(200).json(vote);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Save post toggle
export const savePostToggle = async (req: Request, res: Response) => {
  try {
    const id = req.params.postId;
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const saved = await prisma.$transaction(async (tx) => {
      const existingSave = await tx.savedPost.findUnique({
        where: {
          userid_postid: {
            userid: currentUser.id,
            postid: id,
          },
        },
      });
      if (existingSave) {
        await tx.savedPost.delete({
          where: { id: existingSave.id },
        });
        return { message: "Post unsaved" };
      } else {
        const savedPost = await tx.savedPost.create({
          data: {
            userid: currentUser.id,
            postid: id,
          },
        });
        return { message: "Post saved", savedPost };
      }
    });
    if (!saved) {
      return res.status(500).json({ error: "Failed to toggle save post" });
    }
    return res.status(200).json(saved);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
