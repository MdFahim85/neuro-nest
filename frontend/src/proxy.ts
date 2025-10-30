import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const { pathname } = request.nextUrl;

  if (accessToken && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }
  if (!accessToken && pathname.startsWith("/profile")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/profile  "],
};
