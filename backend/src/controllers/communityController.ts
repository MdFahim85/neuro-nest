import { Request, Response } from "express";
import prisma from "../config/prisma";
import { error } from "console";

// Get all communities
export const getAllCommunities = async (req: Request, res: Response) => {
  try {
    const communities = await prisma.subCommunity.findMany();
    const existingComms = communities.filter(
      (community) => community.isdeleted !== true
    );
    if (!existingComms || !existingComms.length) {
      return res.status(404).json({ error: "No communities found" });
    }
    return res.status(200).json({
      message: `${existingComms.length} Communities found`,
      existingComms,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a community details
export const getCommunityDetails = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const community = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });
    if (!community || community.isdeleted) {
      return res.status(404).json({ error: "Community not found" });
    }
    return res.status(200).json({ message: "Community found", community });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create community
export const createCommunity = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const { name, description, rules } = req.body;
    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "Name and Description are required" });
    }
    const existingComm = await prisma.subCommunity.findUnique({
      where: { name },
    });
    if (existingComm) {
      return res.status(409).json({ error: "Community name already exists" });
    }
    const newCommunity = await prisma.$transaction(async (tx) => {
      // Step 1: Create SubCommunity
      const subCommunity = await tx.subCommunity.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          description,
          ...(rules && { rules }),
          creatorid: currentUser.id,
        },
      });

      // Step 2: Create Moderator
      const moderator = await tx.moderator.create({
        data: {
          userid: currentUser.id,
          subcommunityid: subCommunity.id,
          issupermoderator: true,
        },
      });

      return { subCommunity, moderator };
    });
    if (!newCommunity) {
      return res.status(400).json({ error: "Failed to create community" });
    }
    return res
      .status(201)
      .json({ message: "Community created successfully", newCommunity });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update community
export const updateCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const currentUser = req.user;
    const { name, description, rules } = req.body;
    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const existingComm = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });
    if (!existingComm) {
      return res.status(404).json({ error: "Community not found" });
    }
    if (currentUser.id !== existingComm.creatorid) {
      return res
        .status(403)
        .json({ error: "You cannot update informations of this community" });
    }
    const updatedComm = await prisma.subCommunity.update({
      where: { id: existingComm.id },
      data: {
        ...(name && { name }),
        ...(name && { slug: name.toLowerCase().replace(/\s+/g, "-") }),
        ...(description && { description }),
        ...(rules && { rules }),
      },
    });
    if (!updatedComm) {
      return res.status(400).json({ error: "Failed to update the community" });
    }
    return res.status(200).json({
      message: "Community information updated successfully",
      updatedComm,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete community
export const deleteCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    const existsComm = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });

    if (!existsComm) {
      return res.status(404).json({ error: "Community not found" });
    }

    // Authorization check (only creator, super mod, or admin)
    if (
      existsComm.creatorid !== currentUser.id &&
      !["ADMIN", "SUPER_ADMIN"].includes(currentUser.role as string)
    ) {
      const isSuperMod = await prisma.moderator.findFirst({
        where: {
          userid: currentUser.id,
          subcommunityid: communityId,
          issupermoderator: true,
        },
      });
      if (!isSuperMod) {
        return res
          .status(403)
          .json({ error: "You are not authorized to delete this community" });
      }
    }

    // --- Transaction: Soft delete community + delete moderators ---
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Soft delete community
      const deletedCommunity = await tx.subCommunity.update({
        where: { id: existsComm.id },
        data: { isdeleted: true },
      });

      // 2️⃣ Remove moderators of this community
      await tx.moderator.deleteMany({
        where: { subcommunityid: existsComm.id },
      });

      return deletedCommunity;
    });

    if (!result) {
      return res.status(400).json({ error: "Failed to delete community" });
    }

    res.status(200).json({
      message: "Community deleted successfully",
      community: result,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Join community
export const joinCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const currentUserId = req.user?.id;

    // 1️⃣ Check if the community exists
    const existingComm = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });

    if (!existingComm || existingComm.isdeleted) {
      return res.status(404).json({ error: "Community not found" });
    }

    // 2️⃣ Check if the user is already a moderator
    const isModerator = await prisma.moderator.findFirst({
      where: { userid: currentUserId, subcommunityid: communityId },
    });

    // 3️⃣ Check if the user is already a member
    const isMember = await prisma.joinRequest.findFirst({
      where: {
        userid: currentUserId,
        subcommunityid: communityId,
        OR: [{ status: "APPROVED" }, { status: "PENDING" }],
      },
    });

    if (isModerator || isMember) {
      return res
        .status(400)
        .json({ error: "You are already in the community" });
    }

    // 4️⃣ Determine status based on privacy
    const status = existingComm.isprivate ? "PENDING" : "APPROVED";

    // 5️⃣ Create the join request
    const joinRequest = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create join request
      const jr = await tx.joinRequest.create({
        data: {
          userid: currentUserId as string,
          subcommunityid: communityId,
          status,
        },
      });

      // 2️⃣ Increment member count only if APPROVED
      let updatedCommunity = null;
      if (status === "APPROVED") {
        updatedCommunity = await tx.subCommunity.update({
          where: { id: communityId },
          data: { membercount: { increment: 1 } },
        });
      }

      return { joinRequest: jr, updatedCommunity };
    });

    return res.status(201).json({
      message: `Join request ${status.toLowerCase()}`,
      joinRequest: joinRequest.joinRequest,
      community: joinRequest.updatedCommunity,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Leave community
export const leaveCommunity = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;
    const currentUserId = req.user?.id;

    // 1️⃣ Check if community exists
    const community = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });

    if (!community || community.isdeleted) {
      return res.status(404).json({ error: "Community not found" });
    }

    // 2️⃣ Check if user is a moderator
    const moderator = await prisma.moderator.findFirst({
      where: { userid: currentUserId, subcommunityid: communityId },
    });

    if (moderator) {
      return res.status(400).json({
        error:
          "Moderators cannot leave the community. Remove moderator role first.",
      });
    }

    // 3️⃣ Check if user is a member (approved join request)
    const member = await prisma.joinRequest.findFirst({
      where: {
        userid: currentUserId,
        subcommunityid: communityId,
        status: "APPROVED",
      },
    });

    if (!member) {
      return res
        .status(400)
        .json({ error: "You are not a member of this community" });
    }

    // 4️⃣ Transaction: delete join request + decrement memberCount
    const result = await prisma.$transaction(async (tx) => {
      // Delete the join request
      await tx.joinRequest.delete({
        where: { id: member.id },
      });

      // Decrement member count
      const updatedCommunity = await tx.subCommunity.update({
        where: { id: communityId },
        data: { membercount: { decrement: 1 } },
      });

      return updatedCommunity;
    });

    return res.status(200).json({
      message: "You have left the community successfully",
      community: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get community members
export const getCommunityMembers = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;

    // 1️⃣ Check if the community exists
    const community = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });

    if (!community || community.isdeleted) {
      return res.status(404).json({ error: "Community not found" });
    }

    // 2️⃣ Fetch approved members
    const joinRequests = await prisma.joinRequest.findMany({
      where: {
        subcommunityid: communityId,
        status: "APPROVED",
      },
    });

    // 3️⃣ Fetch user details manually
    const userIds = joinRequests.map((jr) => jr.userid);
    const members = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        displayname: true,
        profilepicture: true,
      },
    });

    // 3️⃣ Optional: fetch moderators
    const moderators = await prisma.moderator.findMany({
      where: { subcommunityid: communityId },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            displayname: true,
            profilepicture: true,
          },
        },
      },
    });

    return res.status(200).json({
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
      },
      moderators: moderators.map((m) => m.User),
      members,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get community posts (#pagination required)
export const getCommunityPosts = async (req: Request, res: Response) => {
  try {
    const { communityId } = req.params;

    const community = await prisma.subCommunity.findUnique({
      where: { id: communityId },
    });

    if (!community || community.isdeleted) {
      return res.status(404).json({ error: "Community not found" });
    }

    // 2️⃣ Fetch posts
    const posts = await prisma.post.findMany({
      where: { subcommunityid: communityId },
      orderBy: { createdat: "desc" },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            displayname: true,
            profilepicture: true,
          },
        },
      },
    });

    return res.status(200).json({
      community: {
        id: community.id,
        name: community.name,
        slug: community.slug,
      },
      posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
