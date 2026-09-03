import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(req: NextRequest, ev: any) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isConfigured =
    publishableKey &&
    !publishableKey.includes("please-provide-clerk-key") &&
    publishableKey !== "pk_test_...";

  if (!isConfigured) {
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const url = new URL("/sign-in", req.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
  const handler = clerkMiddleware(async (auth, r) => {
    if (isProtectedRoute(r)) {
      await auth.protect();
    }
  });

  return handler(req, ev);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
