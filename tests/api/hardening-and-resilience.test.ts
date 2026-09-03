import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRawUnsafe: vi.fn(),
    user: { findUnique: vi.fn() },
    landingPage: { findUnique: vi.fn(), update: vi.fn() },
    experiment: { findMany: vi.fn(), update: vi.fn() },
    signalEvent: { create: vi.fn() },
    lead: { create: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { checkRateLimit, createRateLimitResponse, getClientIp, _resetRateLimitStore } from "@/lib/rate-limit";
import { GET as healthGet } from "@/app/api/health/route";
import { POST as trackPost } from "@/app/api/track/route";

describe("Phase 3: Production Hardening, Rate Limiting & Resilience", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetRateLimitStore();
  });

  describe("Rate Limiting Utility (lib/rate-limit.ts)", () => {
    it("allows requests up to configured limit and blocks excess", () => {
      const key = "test-client-ip";
      const options = { limit: 3, windowMs: 10000 };

      const res1 = checkRateLimit(key, options);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = checkRateLimit(key, options);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = checkRateLimit(key, options);
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);

      // 4th request exceeds quota
      const res4 = checkRateLimit(key, options);
      expect(res4.success).toBe(false);
      expect(res4.remaining).toBe(0);
      expect(res4.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("creates standard 429 response with RFC headers", () => {
      const result = {
        success: false,
        limit: 10,
        remaining: 0,
        resetMs: 45000,
        retryAfterSeconds: 45,
      };

      const response = createRateLimitResponse(result);
      expect(response.status).toBe(429);
      expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(response.headers.get("Retry-After")).toBe("45");
    });

    it("extracts IP correctly across proxies", () => {
      const req1 = {
        headers: new Headers({ "x-forwarded-for": "203.0.113.195, 70.41.3.18" }),
      } as never;
      expect(getClientIp(req1)).toBe("203.0.113.195");

      const req2 = {
        headers: new Headers({ "x-real-ip": "198.51.100.42" }),
      } as never;
      expect(getClientIp(req2)).toBe("198.51.100.42");

      const req3 = {
        headers: new Headers(),
      } as never;
      expect(getClientIp(req3)).toBe("127.0.0.1");
    });
  });

  describe("Health & Liveness Probe (/api/health)", () => {
    it("returns 200 and healthy status when database ping succeeds", async () => {
      (prisma.$queryRawUnsafe as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ 1: 1 }]);

      const res = await healthGet();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("healthy");
      expect(json.checks.database.status).toBe("connected");
      expect(typeof json.checks.database.latencyMs).toBe("number");
      expect(json.version).toBe("1.0.0");
    });

    it("returns 503 and degraded status when database ping fails", async () => {
      (prisma.$queryRawUnsafe as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Connection refused to database")
      );

      const res = await healthGet();
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.status).toBe("degraded");
      expect(json.checks.database.status).toBe("error");
      expect(json.checks.database.error).toContain("Connection refused");
    });
  });

  describe("Telemetry Rate Limiting Integration (/api/track)", () => {
    it("returns 429 Too Many Requests when IP rate limit is exceeded", async () => {
      // Simulate exhausting the 60 requests/min quota
      for (let i = 0; i < 60; i++) {
        checkRateLimit("track:192.168.1.50", { limit: 60, windowMs: 60000 });
      }

      const req = {
        headers: new Headers({ "x-forwarded-for": "192.168.1.50" }),
        json: async () => ({ slug: "test-landing-page" }),
      } as never;

      const res = await trackPost(req);
      expect(res.status).toBe(429);
      expect(res.headers.get("Retry-After")).toBeDefined();
    });
  });
});
