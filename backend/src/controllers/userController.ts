import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { supabase } from "../config/supabaseClient";
import { error } from "console";

// Get personal details
export const getMyDetails = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    return res.status(200).json({ message: user });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get user Details
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const user = await prisma.user.findUnique({
      where: { id: id },
      omit: {
        role: true,
        warningcount: true,
        isbanned: true,
        isdeleted: true,
        createdat: true,
        updatedat: true,
      },
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update personal details
export const updateMyDetails = async (req: Request, res: Response) => {
  try {
    const { displayName, bio, dateOfBirth, profilePicture, bannerImage } =
      req.body;
    const user = req.user;

    // Finding if user exists in db
    const dbUser = await prisma.user.findUnique({ where: { id: user?.id } });
    if (!dbUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Updating user and returning updated details
    const updatedUser = await prisma.user.update({
      where: { id: user?.id },
      data: {
        ...(displayName && { displayname: displayName }),
        ...(bio && { bio }),
        ...(dateOfBirth && { dateofbirth: dateOfBirth }),
        ...(profilePicture && { profilepicture: profilePicture }),
        ...(bannerImage && { bannerimage: bannerImage }),
      },
    });
    return res
      .status(200)
      .json({ message: "Successfully updated user details", updatedUser });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update password
export const changeUserPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    const user = req.user;
    const userId = user?.id as string;

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res
      .status(200)
      .json({ message: "Password updated successfully", data });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get user posts (#pagination required)
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const posts = await prisma.post.findMany({
      where: { authorid: user.id },
      orderBy: { createdat: "desc" },
    });

    const existingPosts = posts.filter((post) => post.isdeleted !== true);
    if (!existingPosts || !existingPosts.length) {
      return res.status(404).json({ error: "Posts not found" });
    }
    return res.status(200).json({ message: "User posts found", existingPosts });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get saved posts (#pagination required)
export const getSavedPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const userSavedPosts = await prisma.savedPost.findMany({
      where: { userid: user?.id },
      include: {
        Post: {
          select: {
            title: true,
            content: true,
            mediaurls: true,
            hashtags: true,
            subcommunityid: true,
            createdat: true,
            updatedat: true,
          },
        },
      },
    });

    if (!userSavedPosts) {
      return res.status(404).json({ error: "No saved post found" });
    }
    return res
      .status(200)
      .json({ message: "Saved posts found", userSavedPosts });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Follow user
export const followUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const followUser = await prisma.user.findUnique({ where: { id } });
    if (!followUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (currentUser?.id === followUser.id) {
      return res.status(403).json({ error: "You cannot follow yourself" });
    }

    const following = await prisma.$transaction(async (tx) => {
      const newFollow = await tx.follow.create({
        data: {
          followerid: currentUser.id,
          followingid: followUser.id,
        },
      });
      const notification = await tx.notification.create({
        data: {
          userid: followUser.id,
          type: "FOLLOW",
          content: `${currentUser.displayname} has started following you`,
        },
      });
      return { newFollow, notification };
    });
    return res
      .status(200)
      .json({ message: "User followed successfully", data: following });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Unfollow user
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const currentUser = req.user;
    const unfollowingUser = await prisma.user.findUnique({ where: { id } });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!unfollowingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = await prisma.follow.findUnique({
      where: {
        followerid_followingid: {
          followerid: currentUser.id,
          followingid: unfollowingUser.id,
        },
      },
    });
    if (!following) {
      return res.status(404).json({ error: "You are not following this user" });
    }

    const unfollowed = await prisma.follow.delete({
      where: {
        followerid_followingid: {
          followerid: currentUser.id,
          followingid: unfollowingUser.id,
        },
      },
    });
    return res
      .status(200)
      .json({ message: "User unfollowed successfully", unfollowed });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get user followers

export const getUserFollowers = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const followers = await prisma.follow.findMany({
      where: { followingid: id },
      select: {
        User_Follow_followeridToUser: {
          select: {
            id: true,
            username: true,
            displayname: true,
            profilepicture: true,
            bannerimage: true,
            bio: true,
            _count: {
              select: {
                Follow_Follow_followeridToUser: true,
                Follow_Follow_followingidToUser: true,
              },
            },
          },
        },
      },
    });
    if (!followers || !followers.length) {
      return res.status(404).json({ error: "No followers found" });
    }
    return res.status(200).json({ message: "Followers found", followers });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get user followings
export const getUserFollowings = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const followings = await prisma.follow.findMany({
      where: { followerid: id },
      select: {
        User_Follow_followingidToUser: {
          select: {
            id: true,
            username: true,
            displayname: true,
            profilepicture: true,
            bannerimage: true,
            bio: true,
            _count: {
              select: {
                Follow_Follow_followeridToUser: true,
                Follow_Follow_followingidToUser: true,
              },
            },
          },
        },
      },
    });
    if (!followings || !followings.length) {
      return res.status(404).json({ error: "No followings found" });
    }
    return res.status(200).json({ message: "Followings found", followings });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
