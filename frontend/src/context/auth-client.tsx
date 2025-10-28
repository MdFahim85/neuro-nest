"use client";

import { User } from "@/types";
import { createContext, useContext } from "react";

interface AuthContextType {
  user?: User;
  token?: string;
}

const AuthContext = createContext<AuthContextType>({});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default function AuthClientProvider({
  children,
  user,
  token,
}: {
  children: React.ReactNode;
  user?: User;
  token?: string;
}) {
  return (
    <AuthContext.Provider value={{ user, token }}>
      {children}
    </AuthContext.Provider>
  );
}
