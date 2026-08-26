import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // authorized callback in auth.config handles redirects — this is fallback
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  if (isDashboard && !isLoggedIn) {
    const url = new URL("/sign-in", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
