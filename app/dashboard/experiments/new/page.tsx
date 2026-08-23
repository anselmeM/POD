"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewExperimentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    // Mock: in production this would call an API
    router.push("/dashboard/experiments");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/experiments"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">New Experiment</h1><p className="text-sm text-text-secondary">Set up a new demand validation experiment.</p></div>
      </div>
      <Card>
        <CardHeader><CardTitle>Experiment Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Experiment Name" placeholder="e.g., Time-Savings Positioning Test" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea label="Hypothesis" placeholder="What are you testing?" value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} />
          <Input label="Budget" placeholder="$100" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <Input label="Duration" placeholder="7 days" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleCreate} disabled={!name.trim()}>Create Experiment</Button>
            <Link href="/dashboard/experiments"><Button variant="secondary">Cancel</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}