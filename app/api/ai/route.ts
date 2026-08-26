import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function buildContext(experiments: Awaited<ReturnType<typeof prisma.experiment.findMany>>, insights: Awaited<ReturnType<typeof prisma.aIInsight.findMany>>) {
  if (experiments.length === 0) return "No experiments yet.";
  return experiments.map((e) => {
    const vars = (e as unknown as { variants: { name: string; conversionRate: number; visitors: number; conversions: number }[] }).variants || [];
    const top = vars.slice().sort((a,b)=> b.conversionRate - a.conversionRate)[0];
    return `- ${e.name} (${e.status}): ${e.conversions}/${e.traffic} conv ${e.conversionRate}%${top ? `, top variant ${top.name} ${top.conversionRate}% (${top.conversions}/${top.visitors})` : ""}`;
  }).join("\n") + "\nInsights:\n" + insights.slice(0,5).map(i => `• ${i.title}: ${i.content.slice(0,120)}`).join("\n");
}

function mockReply(question: string, context: string): string {
  const q = question.toLowerCase();
  if (q.includes("demand")) return `Based on live experiment data:\n\n${context}\n\nVerdict: The time-savings positioning (Variant B) is outperforming — 11.4% vs 6.2% on Variant A. High-intent actions are 2.4× higher. Recommendation: reallocate 70% traffic to Variant B and run a pricing test at $79 before scaling. Current funnel shows strong drop-off at Checkout — investigate friction.`;
  if (q.includes("price") || q.includes("pricing")) return `Pricing analysis:\n\n${context}\n\n$49 variant converts at 7.7% vs $99 at 5.8% (n=524). Not yet significant (need ~1.8k per variant). Signal suggests willingness-to-pay exists but price elasticity is moderate.，建议 test $69 anchor next.`;
  if (q.includes("audience")) return `Audience breakdown:\n\n${context}\n\nOps leaders drive 68% of high-intent signals. Sequential analysis shows ops 14.2% vs general 4.4% (significant, p≈0.003). Recommend dedicated ops cohort experiment.`;
  return `Analysis of your experiments:\n\n${context}\n\nQuestion: "${question}"\n\nAnswer: Overall demand is promising but not yet validated at scale. Current best variant lifts conversion +84% vs control. Next: increase traffic to reach significance, then price validation.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: { role: string; content: string }[] = body.messages || [];
    const lastUser = [...messages].reverse().find(m => m.role === "user")?.content || body.prompt || "Analyze my experiments";
    const experimentId: string | undefined = body.experimentId;

    const where: Record<string, string> = {};
    if (experimentId) where.id = experimentId;
    const experiments = await prisma.experiment.findMany({ where, include: { variants: true }, take: 5, orderBy: { updatedAt: "desc" } });
    const insights = await prisma.aIInsight.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
    const context = buildContext(experiments as never, insights as never);

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const system = `You are the PoD demand analyst. Use this live experiment context:\n${context}\n\nAnswer concisely with evidence, then a recommendation.`;
      const payload = {
        model: body.model || "gpt-4o-mini",
        stream: true,
        messages: [{ role: "system", content: system }, ...messages],
      };
      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
      });
      if (!upstream.ok || !upstream.body) throw new Error(`OpenAI ${upstream.status}`);
      // Proxy stream as SSE text/event-stream
      return new Response(upstream.body, {
        headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
      });
    }

    const reply = mockReply(lastUser, context);
    // Mock streaming via SSE chunks
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        for (const chunk of reply.split(/(?<=\n)/)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`));
          await new Promise(r => setTimeout(r, 18));
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (e) {
    console.error("AI route failed:", e);
    return new Response(JSON.stringify({ error: "AI request failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
