import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { UserRole } from "@prisma/client";
import { supabase } from "../config/supabaseClient";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken)
    return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(
      accessToken,
      process.env.SUPABASE_JWT_SECRET as string
    ) as { sub: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    return next();
  } catch (err: any) {
    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: "Token expired, please log in again" });
    }

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data?.session) {
        console.error("Failed to refresh session:", error?.message);
        return res.status(401).json({ error: "Session refresh failed" });
      }

      const newSession = data.session;
      const newAccessToken = newSession.access_token;
      const newRefreshToken = newSession.refresh_token;

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      const refreshedPayload = jwt.verify(
        newAccessToken,
        process.env.SUPABASE_JWT_SECRET as string
      ) as { sub: string };

      const user = await prisma.user.findUnique({
        where: { id: refreshedPayload.sub },
      });

      if (!user) return res.status(404).json({ error: "User not found" });

      req.user = user;
      return next();
    } catch (refreshErr: any) {
      console.error("Refresh token failed:", refreshErr.message);
      return res.status(401).json({ error: "Authentication failed" });
    }
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
