import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await prisma.landingPage.findUnique({
      where: { slug },
      select: { name: true, headline: true, subheadline: true, positioning: true },
    });

    if (!page) {
      return {
        title: "Proof of Demand — Smoke Test",
        description: "Validating market demand before writing code.",
      };
    }

    const title = `${page.name} — ${page.headline}`;
    const description =
      page.subheadline || page.positioning || "Join the exclusive early access waitlist.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Proof of Demand — Smoke Test",
      description: "Validating market demand before writing code.",
    };
  }
}

export default function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
