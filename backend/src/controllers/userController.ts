import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const getAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await prisma.user.findFirst();
  res.json({ message: user });
};
