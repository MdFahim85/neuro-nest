import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { UserRole } from "@prisma/client";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];
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
