"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Plus, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useExperimentStore } from "@/lib/store";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function SprintPage() {
  const { experiments, loading, error, fetchExperiments } = useExperimentStore();

  useEffect(() => { fetchExperiments(); }, [fetchExperiments]);

  const active = experiments.filter((e) => e.status === "running");

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Current Sprint</h1><p className="text-sm text-text-secondary">Loading sprint data...</p></div>
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <Card key={i}><CardContent className="p-6 animate-pulse"><div className="h-6 bg-surface-elevated rounded w-48 mb-4" /><div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, j) => <div key={j}><div className="h-4 bg-surface-elevated rounded w-16 mx-auto mb-2" /><div className="h-8 bg-surface-elevated rounded w-12 mx-auto" /></div>)}</div></CardContent></Card>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Current Sprint</h1><p className="text-sm text-text-secondary">Your active validation sprint status.</p></div>
        <Link href="/dashboard/experiments/new"><Button><Plus className="w-4 h-4" />New Experiment</Button></Link>
      </motion.div>

      {error && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{error}</p>
            <Button size="sm" variant="secondary" onClick={() => fetchExperiments()} className="ml-auto"><RefreshCw className="w-3 h-3" /></Button>
          </CardContent>
        </Card>
      )}

      {active.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><p className="text-sm text-text-tertiary mb-4">No running experiments in this sprint.</p><Link href="/dashboard/experiments/new"><Button size="sm">Create an Experiment</Button></Link></CardContent></Card>
      ) : (
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
      )}
    </div>
  );
}