import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

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
