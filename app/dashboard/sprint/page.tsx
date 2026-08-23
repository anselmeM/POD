"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Plus } from "lucide-react";
import Link from "next/link";
import { demoExperiments } from "@/lib/mock-data";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SprintPage() {
  const active = demoExperiments.filter((e) => e.status === "running");
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Current Sprint</h1><p className="text-sm text-text-secondary">Your active validation sprint status.</p></div>
        <Link href="/dashboard/experiments/new"><Button><Plus className="w-4 h-4" />New Experiment</Button></Link>
      </motion.div>
      <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
        {active.map((exp) => (
          <motion.div key={exp.id} variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue" />
                  <CardTitle className="text-base">{exp.name}</CardTitle>
                  <Badge variant="blue">Running</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-xs text-text-tertiary">Traffic</p><p className="text-lg font-mono font-bold">{exp.traffic.toLocaleString()}</p></div>
                <div><p className="text-xs text-text-tertiary">Conversion</p><p className="text-lg font-mono font-bold">{exp.conversionRate}%</p></div>
                <div><p className="text-xs text-text-tertiary">High Intent</p><p className="text-lg font-mono font-bold">{exp.highIntentActions}</p></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}