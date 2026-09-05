"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutDashboard, FlaskConical, Activity, Users,
  Contact, Brain, Layout, FileText, Settings, HelpCircle,
  ArrowRight, Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem { label: string; href: string; icon: React.ElementType; section: string; keywords?: string[]; }

const commands: CommandItem[] = [
  { label: "Overview & Sprint", href: "/dashboard", icon: LayoutDashboard, section: "Validation Pillars", keywords: ["home", "dashboard", "sprint", "summary"] },
  { label: "Experiments & Live Pages", href: "/dashboard/experiments", icon: FlaskConical, section: "Validation Pillars", keywords: ["test", "ab", "variant", "smoke", "pages"] },
  { label: "Demand & Signals Hub", href: "/dashboard/leads", icon: Contact, section: "Validation Pillars", keywords: ["crm", "waitlist", "attribution", "telemetry", "traffic", "signals", "audiences"] },
  { label: "AI Verdict & Executive Brief", href: "/dashboard/ai-analyst", icon: Brain, section: "Validation Pillars", keywords: ["verdict", "go", "pivot", "kill", "pdf", "export", "report"] },
  { label: "Team & Permissions", href: "/dashboard/team", icon: Users, section: "Operations", keywords: ["members", "rbac", "collaborators"] },
  { label: "Audit & Activity Log", href: "/dashboard/history/activity", icon: Activity, section: "Operations", keywords: ["audit", "history", "logs"] },
  { label: "Workspace Settings", href: "/dashboard/settings", icon: Settings, section: "Operations", keywords: ["workspace", "billing", "keys"] },
  { label: "Help & Shortcuts", href: "/dashboard/help", icon: HelpCircle, section: "Operations", keywords: ["docs", "support", "keys"] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [dynamic, setDynamic] = useState<CommandItem[]>([]);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/experiments").then((r) => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
      fetch("/api/landing-pages").then((r) => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
      fetch("/api/leads").then((r) => r.ok ? r.json() : { data: [] }).catch(() => ({ data: [] })),
    ]).then(([exps, lps, leads]) => {
      const items: CommandItem[] = [
        ...(exps.data || []).slice(0, 5).map((e: { id: string; name: string }) => ({ label: e.name, href: `/dashboard/experiments/${e.id}`, icon: FlaskConical, section: "Experiments", keywords: [e.id] })),
        ...(lps.data || []).slice(0, 5).map((p: { slug: string; name: string }) => ({ label: p.name, href: `/p/${p.slug}`, icon: Layout, section: "Landing Pages", keywords: [p.slug] })),
        ...(leads.data || []).slice(0, 5).map((l: { id: string; name: string }) => ({ label: l.name, href: `/dashboard/leads`, icon: Contact, section: "Leads", keywords: [l.name] })),
      ];
      setDynamic(items);
    });
  }, [open]);

  const allCommands = [...commands, ...dynamic];

  const filtered = allCommands.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.section.toLowerCase().includes(q) ||
      cmd.keywords?.some((k) => k.includes(q))
    );
  });

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.section]) acc[cmd.section] = [];
    acc[cmd.section].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleSelect = useCallback(
    (href: string) => { router.push(href); setOpen(false); },
    [router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((p) => Math.min(p + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((p) => Math.max(p - 1, 0)); }
      else if (e.key === "Enter" && filtered[selectedIndex]) { handleSelect(filtered[selectedIndex].href); }
    },
    [filtered, selectedIndex, handleSelect]
  );


  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)] bg-surface-elevated hover:bg-surface border border-border transition-all duration-200 shrink-0"
        title="Search (⌘K)"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden xl:inline">Search...</span>
        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] bg-surface border border-border font-mono">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="command-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              className="w-full max-w-lg mx-4 glass-strong rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-border"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <Search className="w-5 h-5 text-[var(--dash-text-tertiary)]" />
                <input ref={inputRef} type="text" placeholder="Search pages, actions..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent text-sm text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-tertiary)] outline-none" />
                <kbd className="px-2 py-0.5 rounded text-[10px] text-[var(--dash-text-tertiary)] bg-surface-elevated border border-border font-mono">ESC</kbd>
              </div>

              <div className="max-h-80 overflow-y-auto py-2">
                {Object.entries(grouped).map(([section, items]) => (
                  <div key={section}>
                    <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--dash-text-tertiary)]">{section}</p>
                    {items.map((item) => {
                      const Icon = item.icon;
                      const idx = filtered.indexOf(item);
                      return (
                        <button key={item.href} onClick={() => handleSelect(item.href)}
                          className={cn("w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors",
                            idx === selectedIndex ? "bg-[var(--dash-accent)]/10 text-[var(--dash-text-primary)] font-medium" : "text-[var(--dash-text-secondary)] hover:bg-surface-elevated"
                          )}>
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                          {idx === selectedIndex && <ArrowRight className="w-3.5 h-3.5 text-[var(--dash-accent)]" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
                {filtered.length === 0 && <div className="px-5 py-8 text-center"><p className="text-sm text-[var(--dash-text-tertiary)]">No results found</p></div>}
              </div>

              <div className="px-5 py-3 border-t border-border flex items-center gap-4 text-[10px] text-[var(--dash-text-tertiary)] bg-surface-elevated/50">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface border border-border font-mono">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface border border-border font-mono">↵</kbd> Select</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface border border-border font-mono">esc</kbd> Close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

