"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Workspace {
  id: string;
  name: string;
  plan: string;
  role: string;
}

export function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        setWorkspaces(j.data || []);
        if (j.data?.[0]) setActiveId(j.data[0].id);
      })
      .catch(() => {});
  }, []);

  const active = workspaces.find((w) => w.id === activeId) || workspaces[0];

  if (!active) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface border border-border transition-colors shrink-0 max-w-[140px] sm:max-w-[200px]"
      >
        <Building2 className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
        <span className="text-xs font-semibold text-[var(--dash-text-primary)] hidden sm:block truncate">{active.name}</span>
        <ChevronDown className={cn("w-3 h-3 text-text-tertiary transition-transform shrink-0", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 glass-strong rounded-xl shadow-xl py-1.5 z-50 border border-border">
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => { setActiveId(ws.id); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-surface-elevated transition-colors flex items-center justify-between",
                ws.id === activeId ? "text-blue font-semibold" : "text-text-secondary"
              )}
            >
              <span>{ws.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary border border-border">{ws.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
