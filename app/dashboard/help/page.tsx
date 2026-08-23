"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, BookOpen, MessageSquare, Zap, ChevronDown } from "lucide-react";

const faqs = [
  { q: "How do I create an experiment?", a: "Navigate to Experiments → New Experiment. Define your variants, set traffic allocation, and launch. PoD Engine handles statistical significance tracking automatically." },
  { q: "What is a PoD Score?", a: "The PoD Score is a proprietary metric (0–100) that combines conversion lift, confidence level, and sample size into a single actionable number. A score above 80 indicates high-confidence results." },
  { q: "How is traffic split between variants?", a: "Traffic is randomly assigned based on your configured allocation percentages. PoD Engine uses deterministic hashing to ensure consistent user experiences across sessions." },
  { q: "Can I pause a running experiment?", a: "Yes. Pausing stops new traffic allocation but preserves all collected data. You can resume at any time without losing statistical progress." },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const resources = [
    { icon: BookOpen, title: "Documentation", description: "Guides, tutorials, and API reference.", href: "https://docs.podengine.com" },
    { icon: MessageSquare, title: "Contact Support", description: "Get help from our team.", href: "mailto:support@podengine.com" },
    { icon: Zap, title: "Quick Start Guide", description: "Get up and running in 5 minutes.", href: "https://docs.podengine.com/quickstart" },
  ];
  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold">Help & Resources</h1><p className="text-sm text-text-secondary">Get help with PoD Engine.</p></div>
      <div className="grid gap-4">
        {resources.map((r) => {
          const Icon = r.icon;
          return (
            <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer">
              <Card className="hover:border-blue/30 transition-colors cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue/10 flex items-center justify-center"><Icon className="w-5 h-5 text-blue" /></div>
                  <div className="flex-1"><h3 className="font-semibold">{r.title}</h3><p className="text-sm text-text-secondary">{r.description}</p></div>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border/30 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left text-sm font-medium hover:bg-surface-elevated transition-colors"
              >
                {faq.q}
                <ChevronDown className={"w-4 h-4 text-text-tertiary transition-transform " + (openFaq === i ? "rotate-180" : "")} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-text-secondary">{faq.a}</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}