import { cookies } from "next/headers";
import AuthClientProvider from "./auth-client";

export default async function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = await cookies();
  const user = cookie.get("user")?.value;
  const token = cookie.get("token")?.value;

  return (
    <AuthClientProvider user={user} token={token}>
      {children}
    </AuthClientProvider>
  );
}
