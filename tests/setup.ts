import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  useUser: () => ({
    user: {
      id: "usr-demo",
      firstName: "Alex",
      lastName: "Morgan",
      fullName: "Alex Morgan",
      primaryEmailAddress: { emailAddress: "alex@example.com" },
      imageUrl: null,
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useClerk: () => ({
    signOut: vi.fn(),
  }),
  SignIn: () => React.createElement("div", { "data-testid": "clerk-sign-in" }, "Sign In"),
  SignUp: () => React.createElement("div", { "data-testid": "clerk-sign-up" }, "Sign Up"),
  UserButton: () => React.createElement("button", { "data-testid": "clerk-user-button" }, "User"),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn().mockResolvedValue({ userId: "usr-demo" }),
  currentUser: vi.fn().mockResolvedValue({
    id: "usr-demo",
    firstName: "Alex",
    lastName: "Morgan",
    emailAddresses: [{ emailAddress: "alex@example.com" }],
  }),
  clerkMiddleware: vi.fn(() => vi.fn()),
  createRouteMatcher: vi.fn(() => vi.fn()),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
