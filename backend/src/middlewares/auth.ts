import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { UserRole } from "@prisma/client";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(
      token,
      process.env.SUPABASE_JWT_SECRET as string
    );

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Invalid token" });
  }
}

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this resource" });
    }

    next();
  };
}

export async function moderatorVerify(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const currentUserId = req.user?.id;
  const { communityId } = req.params;
  const existsComm = await prisma.subCommunity.findUnique({
    where: { id: communityId },
  });
  if (!existsComm) {
    return res.status(404).json({ error: "Community not found" });
  }
  const isModerator = await prisma.moderator.findUnique({
    where: {
      userid_subcommunityid: {
        userid: currentUserId as string,
        subcommunityid: communityId,
      },
    },
  });
  if (!isModerator) {
    return res
      .status(401)
      .json({ error: "You cannot access this community resource" });
  }
  next();
}
