import { cookies } from "next/headers";
import AuthClientProvider from "./auth-client";

export default async function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = await cookies();
  const user = cookie.get("user")
    ? JSON.parse(cookie.get("user").value)
    : undefined;
  const token = cookie.get("accessToken")?.value;

  return (
    <AuthClientProvider user={user} token={token}>
      {children}
    </AuthClientProvider>
  );
}
