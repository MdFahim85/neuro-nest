import { Request, Response } from "express";
import prisma from "../config/prisma";

// Get all communities
export const getAllCommunities = async (req: Request, res: Response) => {
  try {
    const communities = await prisma.subCommunity.findMany();
    if (!communities || !communities.length) {
      return res.status(404).json({ error: "No communities found" });
    }
    return res.status(200).json({
      message: `${communities.length} Communities found`,
      communities,
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
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }
    return res.status(200).json({ message: "Community found", community });
  } catch (error) {
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
