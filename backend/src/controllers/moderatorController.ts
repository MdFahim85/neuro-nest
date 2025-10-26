import { Request, Response } from "express";
import prisma from "../config/prisma";
import { error } from "console";

// Get all mods
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

// Create mod
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

// Delete mod
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

// Get join requests
export const getJoinRequests = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const communityExists = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });
    if (!communityExists) {
      return res.status(404).json({ error: "Community not found" });
    }
    const requests = await prisma.joinRequest.findMany({
      where: { subcommunityid: communityId },
    });
    if (!requests || !requests.length) {
      return res.status(404).json({ error: "No requests found" });
    }
    const approvedRequests = requests.filter(
      (request) => request.status === "APPROVED"
    );
    const pendingRequests = requests.filter(
      (request) => request.status === "PENDING"
    );
    const rejectedRequests = requests.filter(
      (request) => request.status === "REJECTED"
    );

    return res.status(200).json({
      message: "Requests retrieved successfully",
      approvedRequests,
      pendingRequests,
      rejectedRequests,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Approve/Reject join requests
export const handleJoinRequest = async (req: Request, res: Response) => {
  try {
    const { communityId, requestId } = req.params;
    const communityExists = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });
    if (!communityExists) {
      return res.status(404).json({ error: "Community not found" });
    }
    const requestExists = await prisma.joinRequest.findUnique({
      where: { id: requestId },
    });
    if (!requestExists || requestExists.status !== "PENDING") {
      return res.status(404).json({ error: "Request not found" });
    }
    const { requestAction } = req.body;
    const validActions = ["APPROVED", "REJECTED"];
    if (!validActions.includes(requestAction)) {
      return res.status(400).json({ error: "Invalid request action" });
    }
    const updatedRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: requestAction },
    });
    if (!updatedRequest) {
      return res.status(400).json({ error: "Failed to update join request" });
    }
    if (requestAction === "APPROVED") {
      await prisma.subCommunity.update({
        where: { id: communityId },
        data: { membercount: { increment: 1 } },
      });
    }
    return res.status(200).json({
      message: `User request has been ${requestAction}`,
      updatedRequest,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Community visibility toggle
export const communityVisibility = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const currentUserId = req.user?.id;
    const commExists = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });
    if (!commExists) {
      return res.status(404).json({ error: "Community not found" });
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
      return res.status(403).json({
        error: "You cannot perform this action. You are not the group creator",
      });
    }
    const updatedCommunity = await prisma.subCommunity.update({
      where: { id: communityId },
      data: { isprivate: !commExists.isprivate },
    });
    if (!updatedCommunity) {
      return res
        .status(400)
        .json({ error: "Failed to update community visibility" });
    }
    return res
      .status(200)
      .json({ message: "Community visibility updated", updatedCommunity });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const warnUser = async (req: Request, res: Response) => {
  try {
    const { communityId, userId } = req.params;
    const { postId, commentId, reason } = req.body;
    const currentMod = req.user;
    const commExists = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!commExists || !userExists) {
      return res.status(404).json({
        error: !userExists ? "User not found" : "Community not found",
      });
    }
    if (!reason) {
      return res.status(400).json({ error: "Provide a reason for warning" });
    }
    const warning = await prisma.communityWarning.create({
      data: {
        userid: userId,
        subcommunityid: communityId,
        reason,
        ...(postId && { postid: postId }),
        ...(commentId && { commentid: commentId }),
      },
    });
    if (!warning) {
      return res.status(400).json({ error: "Something went wrong" });
    }
    const warningCount = await prisma.communityWarning.findMany({
      where: { userid: userId, subcommunityid: communityId },
    });
    if (warningCount.length >= 5) {
      const ban = await prisma.communityBan.create({
        data: {
          userid: userId,
          subcommunityid: communityId,
          reason: "User exceeded warning limit",
          bannedby: currentMod?.username as string,
        },
      });
      if (!ban) {
        return res.status(400).json({ error: "Something went wrong" });
      }
      await prisma.subCommunity.update({
        where: { id: communityId },
        data: { membercount: { decrement: 1 } },
      });
      await prisma.post.updateMany({
        where: { authorid: userId },
        data: { isdeleted: true },
      });
      return res.status(200).json({
        message: "User has been banned for exceeding warning limit",
        ban,
      });
    }
    return res.status(200).json({ message: "User has been warned", warning });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { communityId, userId } = req.params;
    const { reason } = req.body;
    const currentMod = req.user;
    const commExists = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!commExists || !userExists) {
      return res.status(404).json({
        error: !userExists ? "User not found" : "Community not found",
      });
    }
    const ban = await prisma.communityBan.create({
      data: {
        userid: userId,
        subcommunityid: communityId,
        reason,
        bannedby: currentMod?.username as string,
      },
    });
    if (!ban) {
      return res.status(400).json({ error: "Something went wrong" });
    }
    await prisma.subCommunity.update({
      where: { id: communityId },
      data: { membercount: { decrement: 1 } },
    });
    await prisma.post.updateMany({
      where: { authorid: userId },
      data: { isdeleted: true },
    });
    return res.status(200).json({
      message: "User banned successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
