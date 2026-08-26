"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/types";
import { EXPERIMENT_TEMPLATES } from "@/lib/experiment-templates";

const CHANNELS = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "meta", label: "Meta" },
  { id: "google", label: "Google" },
  { id: "twitter", label: "Twitter" },
] as const;

type DraftVariant = {
  name: string;
  headline: string;
  cta: string;
  positioning: string;
  trafficAllocation: number;
};

function defaultVariant(idx: number): DraftVariant {
  return {
    name: `Variant ${String.fromCharCode(65 + idx)}`,
    headline: "",
    cta: "Learn More",
    positioning: "",
    trafficAllocation: idx === 0 ? 50 : 50,
  };
}

export default function NewExperimentPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("100");
  const [channels, setChannels] = useState<string[]>(["linkedin", "meta"]);
  const [variants, setVariants] = useState<DraftVariant[]>([defaultVariant(0), defaultVariant(1)]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        const list: Project[] = j.data || [];
        setProjects(list);
        if (list[0]) setProjectId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const totalAllocation = variants.reduce((s, v) => s + (Number(v.trafficAllocation) || 0), 0);

  const toggleChannel = (id: string) => {
    setChannels((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const updateVariant = (idx: number, patch: Partial<DraftVariant>) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const addVariant = () => {
    if (variants.length >= 4) return;
    const next = [...variants, defaultVariant(variants.length)];
    // rebalance equally
    const each = Math.floor(100 / next.length);
    const remainder = 100 - each * next.length;
    setVariants(next.map((v, i) => ({ ...v, trafficAllocation: each + (i === 0 ? remainder : 0) })));
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) return;
    const next = variants.filter((_, i) => i !== idx);
    const each = Math.floor(100 / next.length);
    const remainder = 100 - each * next.length;
    setVariants(next.map((v, i) => ({ ...v, trafficAllocation: each + (i === 0 ? remainder : 0) })));
  };

  const handleCreate = async () => {
    setError("");
    if (!name.trim()) { setError("Experiment name is required."); return; }
    if (!projectId) { setError("Please select a project."); return; }
    if (variants.some((v) => !v.name.trim() || !v.headline.trim())) {
      setError("Each variant needs a name and headline.");
      return;
    }
    if (totalAllocation !== 100) {
      setError(`Traffic allocation must sum to 100% (currently ${totalAllocation}%).`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          projectId,
          budget: Number(budget) || 0,
          channel: channels,
          status: "draft",
          variants: variants.map((v) => ({
            name: v.name.trim(),
            headline: v.headline.trim(),
            cta: v.cta.trim() || "Learn More",
            positioning: v.positioning.trim(),
            trafficAllocation: Number(v.trafficAllocation) || 0,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create experiment");
      router.push(`/dashboard/experiments/${json.data.id}`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  const applyTemplate = (id: string) => {
    const tpl = EXPERIMENT_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    setBudget(String(tpl.budget));
    setChannels(tpl.channel);
    setVariants(tpl.variants.map((v) => ({ ...v })));
    if (!name) setName(`${tpl.name} — ${new Date().toLocaleDateString()}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/experiments"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div><h1 className="text-2xl font-bold">New Experiment</h1><p className="text-sm text-text-secondary">Set up a new demand validation experiment.</p></div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Start from a template</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {EXPERIMENT_TEMPLATES.map((tpl) => (
            <button key={tpl.id} onClick={() => applyTemplate(tpl.id)} className="text-left p-3 rounded-lg border border-border hover:border-blue/30 hover:bg-blue/5 transition-colors">
              <p className="text-sm font-semibold">{tpl.name}</p>
              <p className="text-xs text-text-tertiary">{tpl.description}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Experiment Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Experiment Name" placeholder="e.g., Time-Savings Positioning Test" value={name} onChange={(e) => setName(e.target.value)} required />
          <div>
            <label className="text-sm font-medium">Project</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm">
              {projects.length === 0 && <option value="">Loading…</option>}
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Input label="Budget ($)" type="number" placeholder="100" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <div>
            <label className="text-sm font-medium">Channels</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <label key={ch.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${channels.includes(ch.id) ? "bg-blue text-white border-blue" : "bg-surface border-border text-text-secondary hover:bg-surface-elevated"}`}>
                  <input type="checkbox" className="sr-only" checked={channels.includes(ch.id)} onChange={() => toggleChannel(ch.id)} />
                  {ch.label}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Variants ({variants.length}) — Allocation {totalAllocation}% {totalAllocation !== 100 && <span className="text-red text-xs font-normal">must be 100%</span>}</CardTitle>
          <Button variant="secondary" size="sm" onClick={addVariant} disabled={variants.length >= 4}><Plus className="w-4 h-4" /> Add Variant</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {variants.map((v, idx) => (
            <div key={idx} className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{v.name}</span>
                <Button variant="ghost" size="icon" onClick={() => removeVariant(idx)} disabled={variants.length <= 1}><Trash2 className="w-4 h-4" /></Button>
              </div>
              <Input label="Variant Name" value={v.name} onChange={(e) => updateVariant(idx, { name: e.target.value })} />
              <Input label="Headline" placeholder="e.g., Stop Losing Hours to Manual Reporting" value={v.headline} onChange={(e) => updateVariant(idx, { headline: e.target.value })} />
              <Input label="CTA" placeholder="Learn More" value={v.cta} onChange={(e) => updateVariant(idx, { cta: e.target.value })} />
              <Input label="Positioning (optional)" value={v.positioning} onChange={(e) => updateVariant(idx, { positioning: e.target.value })} />
              <div>
                <label className="text-sm font-medium">Traffic Allocation: {v.trafficAllocation}%</label>
                <input type="range" min={0} max={100} value={v.trafficAllocation} onChange={(e) => updateVariant(idx, { trafficAllocation: Number(e.target.value) })} className="w-full mt-1 accent-blue" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red">{error}</p>}

      <div className="flex gap-3">
        <Button className="flex-1" onClick={handleCreate} disabled={loading || !name.trim() || totalAllocation !== 100}>{loading ? "Creating…" : "Create Experiment"}</Button>
        <Link href="/dashboard/experiments"><Button variant="secondary" disabled={loading}>Cancel</Button></Link>
      </div>
    </div>
  );
}
