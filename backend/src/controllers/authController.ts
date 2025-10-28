import { Request, Response } from "express";
import prisma from "../config/prisma";
import { supabase } from "../config/supabaseClient";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password, username, displayname } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { username: username },
      select: { email: true },
    });

    if (existingUser)
      return res.status(409).json({ error: "Username already exists" });

    const { data: supabaseUser, error: supabaseError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (supabaseError)
      return res.status(400).json({ error: supabaseError.message });

    const user = await prisma.user.create({
      data: {
        id: supabaseUser.user.id,
        email: supabaseUser.user.email as string,
        username,
        displayname,
      },
    });

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return res.status(401).json({ error: error.message });
    const user = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        displayname: true,
        role: true,
        profilepicture: true,
      },
    });
    const cookieOptions = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie("token", data.session?.access_token, cookieOptions);
    res.cookie("user", JSON.stringify(user), cookieOptions);
    return res.status(200).json({
      message: "Login successful",
      token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const signOut = async (_req: Request, res: Response) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.clearCookie("token", cookieOptions);
    res.clearCookie("user", cookieOptions);
    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
