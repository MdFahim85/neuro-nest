import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getAllModerators = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const moderatorList = await prisma.moderator.findMany({
      where: { subcommunityid: communityId },
      include: {
        User: {
          select: {
            displayname: true,
            username: true,
          },
        },
      },
    });
    if (!moderatorList || !moderatorList.length) {
      return res.status(404).json({ error: "Moderators not found" });
    }
    return res.status(200).json({
      message: `${moderatorList.length} moderators found.`,
      moderatorList,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createModerator = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user?.id;
    const alreadyMod = await prisma.moderator.findUnique({
      where: {
        userid_subcommunityid: {
          userid: userId,
          subcommunityid: communityId,
        },
      },
    });
    if (alreadyMod) {
      return res
        .status(409)
        .json({ error: "This user is already a moderator" });
    }
    const newMod = await prisma.moderator.create({
      data: {
        userid: userId,
        subcommunityid: communityId,
      },
    });
    if (!newMod) {
      return res.status(404).json({ error: "Failed to create moderator" });
    }
    return res
      .status(201)
      .json({ message: "User Promoted to moderator", newMod });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteModerator = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user?.id;
    if (userId === currentUserId) {
      return res.status(403).json({ error: "You cannot remove yourself" });
    }
    const currentMod = await prisma.moderator.findUnique({
      where: {
        userid_subcommunityid: {
          userid: currentUserId as string,
          subcommunityid: communityId,
        },
      },
    });
    if (!currentMod?.issupermoderator) {
      return res.status(401).json({
        error: "You cannot delete other moderators",
      });
    }
    const existsMod = await prisma.moderator.findUnique({
      where: {
        userid_subcommunityid: {
          userid: userId,
          subcommunityid: communityId,
        },
      },
    });
    if (!existsMod) {
      return res.status(404).json({ error: "Moderator not found" });
    }
    const deletedMod = await prisma.moderator.delete({
      where: {
        userid_subcommunityid: {
          userid: userId,
          subcommunityid: communityId,
        },
      },
    });
    if (!deletedMod) {
      return res.status(404).json({ error: "Failed to remove moderator" });
    }
    return res
      .status(200)
      .json({ message: "Moderator removed successfully", deletedMod });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
