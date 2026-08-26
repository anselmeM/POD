import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        // Real authorize is in lib/auth.ts (needs DB). Edge middleware never calls this.
        return null;
      },
    }),
  ],
  pages: { signIn: "/sign-in" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      const isAuthPage = request.nextUrl.pathname.startsWith("/sign-in") || request.nextUrl.pathname.startsWith("/sign-up");
      if (isDashboard && !isLoggedIn) return false;
      if (isAuthPage && isLoggedIn) return Response.redirect(new URL("/dashboard", request.nextUrl));
      return true;
    },
  },
  trustHost: true,
};
