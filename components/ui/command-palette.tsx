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
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "Navigation" },
  { label: "Experiments", href: "/dashboard/experiments", icon: FlaskConical, section: "Navigation", keywords: ["test", "ab", "variant"] },
  { label: "Signals", href: "/dashboard/signals", icon: Activity, section: "Navigation", keywords: ["demand", "intent"] },
  { label: "Audiences", href: "/dashboard/audiences", icon: Users, section: "Navigation", keywords: ["segment", "target"] },
  { label: "Leads", href: "/dashboard/leads", icon: Contact, section: "Navigation", keywords: ["contact", "signup"] },
  { label: "AI Analyst", href: "/dashboard/ai-analyst", icon: Brain, section: "Navigation", keywords: ["ai", "analysis", "insight"] },
  { label: "Landing Pages", href: "/dashboard/landing-pages", icon: Layout, section: "Navigation", keywords: ["page", "lp", "variant"] },
  { label: "Reports", href: "/dashboard/reports", icon: FileText, section: "Navigation", keywords: ["export", "pdf"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, section: "Quick Actions" },
  { label: "Help", href: "/dashboard/help", icon: HelpCircle, section: "Quick Actions", keywords: ["docs", "support"] },
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
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)] bg-[#F8F9FA] hover:bg-[#EEF0F2] border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all duration-200"
      >
        <Command className="w-3 h-3" />
        <span>Search...</span>
        <kbd className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-white border border-[#E5E7EB] font-mono">⌘K</kbd>
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
              className="w-full max-w-lg mx-4 glass-strong rounded-2xl overflow-hidden shadow-2xl shadow-black/40"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F3F4F6]">
                <Search className="w-5 h-5 text-[var(--dash-text-tertiary)]" />
                <input ref={inputRef} type="text" placeholder="Search pages, actions..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent text-sm text-[var(--dash-text-primary)] placeholder:text-[var(--dash-text-tertiary)] outline-none" />
                <kbd className="px-2 py-0.5 rounded text-[10px] text-[var(--dash-text-tertiary)] bg-[#F8F9FA] border border-[#E5E7EB] font-mono">ESC</kbd>
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
                            idx === selectedIndex ? "bg-[var(--dash-accent)]/10 text-[var(--dash-text-primary)]" : "text-[var(--dash-text-secondary)] hover:bg-[#F8F9FA]"
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

              <div className="px-5 py-3 border-t border-[#F3F4F6] flex items-center gap-4 text-[10px] text-[var(--dash-text-tertiary)]">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] font-mono">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] font-mono">↵</kbd> Select</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] font-mono">esc</kbd> Close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

