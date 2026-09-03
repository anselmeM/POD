"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Send, ArrowRight, AlertCircle, Plus, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AIInsight } from "@/lib/types";

interface MessageItem {
  id?: string;
  role: "user" | "ai" | "assistant";
  content: string;
}

interface ConversationItem {
  id: string;
  title: string;
  timestamp: string;
  messageCount: number;
  lastMessage: string;
  messages: Array<{ id: string; role: "user" | "assistant"; content: string }>;
}

const suggestedQuestions = [
  "Is there real demand for this product?",
  "Which audience segment shows the strongest demand?",
  "Which variant should we scale based on evidence?",
  "What should we test next?",
  "Does the pricing look viable?",
];

const analysisTemplates = [
  { id: "tpl-001", name: "Demand Verdict", description: "Get an overall demand assessment", prompt: "Is there real demand for this product? Give me a verdict with evidence." },
  { id: "tpl-002", name: "Audience Analysis", description: "Compare audience segments", prompt: "Which audience segment shows the strongest demand signals?" },
  { id: "tpl-003", name: "Pricing Insights", description: "Analyze willingness-to-pay", prompt: "What does the pricing data tell us about willingness to pay?" },
  { id: "tpl-004", name: "Next Experiment", description: "Recommendations for what to test", prompt: "Based on current data, what should we test next?" },
  { id: "tpl-005", name: "Variant Comparison", description: "Deep comparison of variants", prompt: "Compare the variants and recommend which to scale." },
];

export const dynamic = "force-dynamic";

export default function AIAnalystPage() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      role: "ai",
      content: "Hello! I am your AI Validation Analyst. Ask me anything about your experiments, traffic, conversion rates, or audience signals, and I'll analyze the evidence for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/ai/conversations");
      if (res.ok) {
        const json = await res.json();
        const convs: ConversationItem[] = Array.isArray(json.data) ? json.data : [];
        setConversations(convs);
        if (convs.length > 0 && !activeConvId) {
          setActiveConvId(convs[0].id);
          if (convs[0].messages?.length > 0) {
            setMessages(convs[0].messages.map((m) => ({ role: m.role, content: m.content })));
          }
        }
      }
    } catch {}
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/insights");
      if (res.ok) {
        const data = await res.json();
        setInsights(Array.isArray(data.data) ? data.data : []);
      }
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchConversations(), fetchInsights()]).finally(() => setLoading(false));
  }, []);

  const handleSelectConversation = (conv: ConversationItem) => {
    setActiveConvId(conv.id);
    if (conv.messages?.length > 0) {
      setMessages(conv.messages.map((m) => ({ role: m.role, content: m.content })));
    } else {
      setMessages([
        {
          role: "ai",
          content: `Resumed thread: "${conv.title}". What would you like to examine?`,
        },
      ]);
    }
  };

  const handleNewThread = () => {
    setActiveConvId(null);
    setMessages([
      {
        role: "ai",
        content: "Started a new analysis thread. Ask any question about your validation evidence.",
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const prompt = input.trim();
    const nextMsgs: MessageItem[] = [...messages, { role: "user", content: prompt }];
    setMessages(nextMsgs);
    setInput("");
    setStreaming(true);

    // Persist user message
    let currentConvId = activeConvId;
    try {
      const convRes = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConvId,
          title: prompt.slice(0, 35) + "...",
          message: { role: "user", content: prompt },
        }),
      });
      if (convRes.ok) {
        const cJson = await convRes.json();
        currentConvId = cJson.conversationId;
        setActiveConvId(currentConvId);
      }
    } catch {}

    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMsgs.map((m) => ({
            role: m.role === "ai" ? "assistant" : m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("AI request failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content || "";
            if (delta) {
              acc += delta;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "ai", content: acc };
                return copy;
              });
            }
          } catch {}
        }
      }

      // Persist assistant reply
      if (acc && currentConvId) {
        await fetch("/api/ai/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: currentConvId,
            message: { role: "assistant", content: acc },
          }),
        });
        fetchConversations();
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "ai",
          content: "The AI analyst encountered an error processing your query. Please check your connection or try again.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Validation Analyst</h1>
          <p className="text-sm text-text-secondary">Ask questions about your experiment data and get evidence-based analysis.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleNewThread}>
          <Plus className="w-4 h-4" /> New Thread
        </Button>
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
                  <Badge variant="green">Live Model Active</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-blue/10 border border-blue/20 text-text-primary"
                        : "bg-surface-elevated border border-border text-text-primary"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>

            <div className="p-4 border-t border-border">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your validation data..."
                  disabled={streaming}
                  className="flex-1 h-10 rounded-md border border-border bg-surface-elevated px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue disabled:opacity-50"
                />
                <Button type="submit" size="icon" disabled={streaming || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Conversation History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Saved Threads</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleNewThread} className="h-7 text-xs">
                + New
              </Button>
            </CardHeader>
            <CardContent className="space-y-1.5 max-h-48 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-start gap-2 ${
                      activeConvId === conv.id ? "bg-blue/10 border border-blue/30" : "hover:bg-surface-elevated"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{conv.title}</p>
                      <p className="text-[10px] text-text-tertiary">{conv.messageCount} messages</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-text-tertiary text-center py-3">No saved threads yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Analysis Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Analysis Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysisTemplates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setInput(tmpl.prompt)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  <p className="text-xs font-medium">{tmpl.name}</p>
                  <p className="text-[10px] text-text-tertiary line-clamp-1">{tmpl.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-xs text-text-secondary hover:text-blue px-2.5 py-1.5 rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  {q}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.length > 0 ? (
                insights.slice(0, 3).map((ins) => (
                  <div key={ins.id} className="text-xs">
                    <Badge variant={ins.type === "demand" ? "green" : "blue"} className="mb-1">
                      {ins.type}
                    </Badge>
                    <p className="font-medium">{ins.title}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-tertiary text-center py-2">No insights generated yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}