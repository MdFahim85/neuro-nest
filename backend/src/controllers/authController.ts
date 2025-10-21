import { Request, Response } from "express";
import prisma from "../config/prisma";
import { supabase } from "../config/supabaseClient";

export const signUp = async (req: Request, res: Response) => {
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

  res.json({ user });
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return res.status(401).json({ error: error.message });
    return res.status(200).json({
      message: "Login successful",
      token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user: data.user,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
