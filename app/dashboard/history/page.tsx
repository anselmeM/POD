"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { demoHistoryItems } from "@/lib/mock-data";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function HistoryPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Validation History</h1>
        <p className="text-sm text-text-secondary">Your past validation sprints and their outcomes.</p>
      </motion.div>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {demoHistoryItems.map((h) => (
          <motion.div key={h.id} variants={item}>
            <Card className="hover:border-blue/30 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/history/${h.id}`)}>
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center"><Calendar className="w-5 h-5 text-text-tertiary" /></div>
                  <div>
                    <h3 className="font-semibold">{h.project}</h3>
                    <p className="text-xs text-text-tertiary">{h.date} &middot; {h.experiments} experiments</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center"><p className="text-xs text-text-tertiary">PoD Score</p><p className="text-lg font-mono font-bold">{h.score}</p></div>
                  <Badge variant={h.status}>{h.verdict}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}