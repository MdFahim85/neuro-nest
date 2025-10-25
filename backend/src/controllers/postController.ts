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

    if (subCommunityId) {
      const [authorInCommunity, authorInMod] = await Promise.all([
        prisma.joinRequest.findUnique({
          where: {
            userid_subcommunityid: {
              userid: authorId,
              subcommunityid: subCommunityId,
            },
          },
        }),
        prisma.moderator.findUnique({
          where: {
            userid_subcommunityid: {
              userid: authorId,
              subcommunityid: subCommunityId,
            },
          },
        }),
      ]);

      if (!authorInCommunity && !authorInMod) {
        return res
          .status(403)
          .json({ error: "User does not belong in this community" });
      }
    }

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
    if (post) {
      if (subCommunityId) {
        await prisma.subCommunity.update({
          where: { id: subCommunityId },
          data: { postcount: { increment: 1 } },
        });
      }
    }

    if (!post) {
      return res.status(500).json({ error: "Failed to created post" });
    }
    return res.status(201).json({ message: "Post created", post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Getting all posts (#pagination required)
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany();
    const existingPosts = posts.filter((post) => post.isdeleted !== true);
    if (!existingPosts || !existingPosts.length) {
      return res.status(404).json({ error: "No posts found" });
    }
    return res
      .status(200)
      .json({ message: `${existingPosts.length} Posts found`, existingPosts });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get single post
export const getSinglePost = async (req: Request, res: Response) => {
  try {
    const id = req.params.postId;
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.isdeleted) {
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
    if (!post || post.isdeleted) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.authorid !== currentUser?.id) {
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
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    let isAuthorized = false;

    // Case 1: Author
    if (post.authorid === currentUser.id) {
      isAuthorized = true;
    }

    // Case 2: Global moderator or admin
    if (["ADMIN", "SUPER_ADMIN"].includes(currentUser.role as string)) {
      isAuthorized = true;
    }

    // Case 3: Community moderator (if post belongs to a community)
    if (!isAuthorized && post.subcommunityid) {
      const communityModerator = await prisma.moderator.findUnique({
        where: {
          userid_subcommunityid: {
            userid: currentUser.id,
            subcommunityid: post.subcommunityid,
          },
        },
      });

      if (communityModerator) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: "You cannot edit this post" });
    }
    const deleted = await prisma.post.update({
      where: { id },
      data: { isdeleted: true },
    });
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

// Search posts
export const searchPosts = async (req: Request, res: Response) => {
  try {
    const title = req.query.title as string;
    const hashTags = req.query.hashTags as string;

    if (
      (!title || title.trim() === "") &&
      (!hashTags || hashTags.trim() === "")
    ) {
      return res.status(400).json({
        error: "At least one query parameter (title or hashTags) is required",
      });
    }

    const filters: any = [];

    if (title && title.trim() !== "") {
      filters.push({
        title: { contains: title, mode: "insensitive" },
      });
    }

    if (hashTags && hashTags.trim() !== "") {
      filters.push({
        hashtags: { hasSome: hashTags.split(",").map((tag) => tag.trim()) },
      });
    }

    const posts = await prisma.post.findMany({
      where: {
        OR: filters,
      },
    });

    if (!posts || !posts.length) {
      return res.status(404).json({ error: "No posts found" });
    }

    return res
      .status(200)
      .json({ message: `${posts.length} posts found`, posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get comments for a post
export const getPostComments = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comments = await prisma.comment.findMany({
      where: { postid: postId },
    });
    if (!comments || !comments.length) {
      return res.status(404).json({ error: "Comments not found" });
    }
    return res
      .status(200)
      .json({ message: `${comments.length} Comments found`, comments });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Create comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const { content, parentId } = req.body;
    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content is required" });
    }
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const result = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          content,
          ...(parentId && { parentid: parentId }),
          Post: { connect: { id: postId } },
          User: { connect: { id: currentUser.id } },
        },
      });

      if (post.authorid !== currentUser.id) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            content: `${currentUser.displayname} has commented on your post "${post.title}"`,
            userid: post.authorid,
            relatedentityid: postId,
          },
        });
      }

      return comment;
    });

    return res
      .status(201)
      .json({ message: "Comment created", comment: result });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { postId, commentId } = req.params;

    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.authorid !== currentUser.id) {
      return res.status(403).json({ error: "You cannot edit this comment" });
    }
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
      },
    });
    if (!updatedComment) {
      return res.status(500).json({ error: "Failed to update comment" });
    }
    return res.status(200).json({ message: "Comment updated", updatedComment });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { postId, commentId } = req.params;
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (
      comment.authorid !== currentUser.id &&
      currentUser?.role !== "ADMIN" &&
      currentUser?.role !== "SUPER_ADMIN"
    ) {
      return res.status(403).json({ error: "You cannot delete this comment" });
    }
    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
    });
    if (!deletedComment) {
      return res.status(500).json({ error: "Failed to delete comment" });
    }
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Vote toggle on comment
export const voteToggleComment = async (req: Request, res: Response) => {
  try {
    const voteType = req.body.voteType as "UPVOTE" | "DOWNVOTE";
    const { postId, commentId } = req.params;
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    const vote = await prisma.$transaction(async (tx) => {
      const existingVote = await tx.vote.findFirst({
        where: {
          postid: postId,
          commentid: commentId,
          userid: currentUser?.id,
        },
      });

      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          authorid: true,
          upvotecount: true,
          downvotecount: true,
        },
      });

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

        const updatedComment = await tx.comment.update({
          where: { id: commentId },
          data: updateField,
          select: { id: true, upvotecount: true, downvotecount: true },
        });

        message = "Vote removed";

        return {
          message,
          comment: updatedComment,
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

        const updatedComment = await tx.comment.update({
          where: { id: commentId },
          data,
          select: { id: true, upvotecount: true, downvotecount: true },
        });

        // Create notification (if not own comment)
        if (comment?.authorid === currentUser?.id) {
          await tx.notification.create({
            data: {
              userid: post.authorid,
              type: `${voteType}`,
              content: `${currentUser?.username} changed their vote on your comment to ${voteType}.`,
              relatedentityid: comment?.id as string,
            },
          });
        }

        message = "Vote updated";

        return {
          message,
          vote: updatedVote,
          comment: updatedComment,
        };
      }

      // --- CASE 3: New vote
      newVote = await tx.vote.create({
        data: {
          postid: postId,
          commentid: commentId,
          userid: currentUser?.id!,
          votetype: voteType,
        },
      });

      const updateField =
        voteType === "UPVOTE"
          ? { upvotecount: { increment: 1 } }
          : { downvotecount: { increment: 1 } };

      const updatedComment = await tx.comment.update({
        where: { id: commentId },
        data: updateField,
        select: { id: true, upvotecount: true, downvotecount: true },
      });

      // Create notification (if not voting on own comment)
      if (comment?.authorid === currentUser?.id) {
        await tx.notification.create({
          data: {
            userid: post.authorid,
            type: `${voteType}`,
            content: `${
              currentUser?.username
            } ${voteType.toLowerCase()}d your post.`,
            relatedentityid: comment?.id as string,
          },
        });
      }

      message = "Vote added";

      return {
        message,
        vote: newVote,
        comment: updatedComment,
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
