"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const cohortData = months.map((m, i) => ({
  month: m,
  "Ops Leaders": 4 + i * 1.2 + Math.random() * 0.8,
  Founders: 3 + i * 0.6 + Math.random() * 0.6,
  Finance: 2.5 + i * 0.4 + Math.random() * 0.5,
  Product: 3.2 + i * 0.8 + Math.random() * 0.7,
}));

export default function CohortsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/audiences"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">Cohort Analysis</h1><p className="text-sm text-text-secondary">Segment performance over time</p></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Conversion by Segment (6 months)</CardTitle></CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="Ops Leaders" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Founders" stroke="#22C55E" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Finance" stroke="#F4CF38" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Product" stroke="#8165FA" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Insights</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-text-secondary">Ops Leaders cohort shows strongest upward trend (+6.2% → 9.8%). Recommend focusing acquisition on this segment. Finance remains flat — consider refining message.</p></CardContent>
      </Card>
    </div>
  );
}
