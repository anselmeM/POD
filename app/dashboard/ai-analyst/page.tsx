"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Send, CheckCircle2, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AIInsight } from "@/lib/types";

const suggestedQuestions = [
  "Is there real demand?",
  "Which audience is strongest?",
  "Which variant should we scale?",
  "What should we test next?",
  "Does the pricing look viable?",
];

export default function AIAnalystPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    { role: "user" as const, content: "Is there real demand for this product?" },
    {
      role: "ai" as const,
      content: "Verdict: Promising, but not yet validated.\n\nEvidence:\n- 11.4% conversion on winning variant (Variant B)\n- 7.7% high-intent rate across experiments\n- 2.1x stronger pricing interaction on time-savings positioning\n- Audience concentration around operations leaders (68% of high-intent signals)\n\nThe current evidence is encouraging but insufficient to declare validated demand. The sample size is below statistical significance for pricing decisions, and we haven't tested willingness-to-pay at scale.\n\nNext recommended experiment: Test the winning message against a higher price point ($49 vs $79) before increasing acquisition spend.",
    },
  ]);
  const [input, setInput] = useState("");

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights");
      if (res.ok) {
      const data = await res.json();
      setInsights(data.data || []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsights(); }, []);

  const conversations = [
    { id: "conv-001", title: "Initial demand assessment", lastMessage: "The data suggests moderate demand...", timestamp: "2026-01-15T14:30:00Z", messageCount: 8 },
    { id: "conv-002", title: "Audience segment comparison", lastMessage: "Operations managers show 3.2x higher...", timestamp: "2026-01-15T10:15:00Z", messageCount: 5 },
    { id: "conv-003", title: "Pricing strategy analysis", lastMessage: "The $49-99 range appears viable...", timestamp: "2026-01-14T11:45:00Z", messageCount: 6 },
    { id: "conv-004", title: "Variant performance deep-dive", lastMessage: "Variant B outperforms on every metric...", timestamp: "2026-01-13T09:30:00Z", messageCount: 4 },
  ];

  const analysisTemplates = [
    { id: "tpl-001", name: "Demand Verdict", description: "Get an overall demand assessment", prompt: "Is there real demand for this product? Give me a verdict with evidence." },
    { id: "tpl-002", name: "Audience Analysis", description: "Compare audience segments", prompt: "Which audience segment shows the strongest demand signals?" },
    { id: "tpl-003", name: "Pricing Insights", description: "Analyze willingness-to-pay", prompt: "What does the pricing data tell us about willingness to pay?" },
    { id: "tpl-004", name: "Next Experiment", description: "Recommendations for what to test", prompt: "Based on current data, what should we test next?" },
    { id: "tpl-005", name: "Variant Comparison", description: "Deep comparison of variants", prompt: "Compare the variants and recommend which to scale." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Validation Analyst</h1>
        <p className="text-sm text-text-secondary">Ask questions about your experiment data and get evidence-based analysis.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue" />
                </div>
                <div>
                  <CardTitle className="text-base">AI Analyst</CardTitle>
                  <Badge variant="green">Confidence: 78%</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 ${msg.role === "user" ? "bg-blue/10 border border-blue/20" : "bg-surface-elevated border border-border"}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>

            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!input.trim()) return;
                  setMessages((prev) => [...prev, { role: "user", content: input }]);
                  setInput("");
                  setTimeout(() => {
                    setMessages((prev) => [...prev, {
                      role: "ai",
                      content: "Based on the current experiment data, the evidence suggests moderate-to-strong demand signals. The time-savings positioning is resonating most with operations leaders. I recommend running a focused pricing test with the winning variant before scaling acquisition spend.",
                    }]);
                  }, 1000);
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your validation data..."
                  className="flex-1 h-10 rounded-md border border-border bg-surface-elevated px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue"
                />
                <Button type="submit" size="icon"><Send className="w-4 h-4" /></Button>
              </form>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Conversation History */}
          <Card>
            <CardHeader><CardTitle className="text-base">Conversation History</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {conversations.map((conv) => (
                <button key={conv.id} className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors">
                  <p className="text-xs font-medium truncate">{conv.title}</p>
                  <p className="text-[10px] text-text-tertiary">{conv.messageCount} messages · {conv.timestamp}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Analysis Templates */}
          <Card>
            <CardHeader><CardTitle className="text-base">Analysis Templates</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {analysisTemplates.map((tmpl) => (
                <button key={tmpl.id} onClick={() => setInput(tmpl.prompt)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors">
                  <p className="text-xs font-medium">{tmpl.name}</p>
                  <p className="text-[10px] text-text-tertiary line-clamp-1">{tmpl.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Suggested Questions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((q) => (
                <button key={q} onClick={() => setInput(q)} className="w-full text-left text-sm text-text-secondary hover:text-blue px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors">
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Key Insights</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {insights.length > 0 ? insights.slice(0, 3).map((ins) => (
                <div key={ins.id} className="text-xs">
                  <Badge variant={ins.type === "demand" ? "green" : "blue"} className="mb-1">{ins.type}</Badge>
                  <p className="font-medium">{ins.title}</p>
                </div>
              )) : <p className="text-xs text-text-tertiary text-center py-2">No insights yet.</p>}
            </CardContent>
          </Card>

          <Button className="w-full group" variant="secondary">
            Create Recommended Experiment
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}