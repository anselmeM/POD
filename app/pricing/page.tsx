"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoPricingTiers } from "@/lib/mock-data";

export default function PricingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <MarketingNav />
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h1
              className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Validate smarter, not harder.
            </motion.h1>
            <motion.p
              className="text-lg text-text-secondary max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Choose the plan that fits your validation needs. Every tier includes
              AI-powered analysis and real-world demand testing.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {demoPricingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <Card className={`p-6 h-full flex flex-col ${tier.highlighted ? "border-blue ring-1 ring-blue/20" : ""}`}>
                  {tier.highlighted && (
                    <Badge variant="blue" className="self-start mb-4">Most Popular</Badge>
                  )}
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-text-secondary mb-4">{tier.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-text-secondary">{tier.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                        <Check className="w-4 h-4 text-green shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up">
                    <Button
                      className="w-full"
                      variant={tier.highlighted ? "default" : "secondary"}
                      size="lg"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center text-sm text-text-secondary mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Prefer performance pricing?{" "}
            <Link href="#" className="text-blue hover:text-blue-bright">
              Ask about outcome-based validation engagements.
            </Link>
          </motion.p>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}