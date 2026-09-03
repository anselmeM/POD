"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ChevronDown, Menu, X,
  LogOut, Settings, User,
  LayoutDashboard, FlaskConical, Layout, Activity, Brain,
  Users, Contact, FileText, Zap, History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrbField } from "@/components/ui/animated-orb";
import { CommandPalette } from "@/components/ui/command-palette";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ShortcutHelp } from "@/components/ui/shortcut-help";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useUser, useClerk } from "@clerk/nextjs";

// Primary high-frequency navigation tabs
const PRIMARY_NAV = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Experiments", href: "/dashboard/experiments", icon: FlaskConical },
  { label: "Landing Pages", href: "/dashboard/landing-pages", icon: Layout },
  { label: "Signals", href: "/dashboard/signals", icon: Activity },
  { label: "AI Analyst", href: "/dashboard/ai-analyst", icon: Brain },
];

// Secondary / Specialized features in 'More' dropdown
const MORE_NAV = [
  { label: "Audiences", href: "/dashboard/audiences", icon: Users, desc: "Segment analytics & cohorts" },
  { label: "Leads", href: "/dashboard/leads", icon: Contact, desc: "High-intent CRM pipeline" },
  { label: "Sprint Mode", href: "/dashboard/sprint", icon: Zap, desc: "7-day validation countdown" },
  { label: "Reports", href: "/dashboard/reports", icon: FileText, desc: "Executive exports & summaries" },
  { label: "Activity Log", href: "/dashboard/history/activity", icon: History, desc: "Audit trail & event timeline" },
];

const ALL_MOBILE_NAV = [
  ...PRIMARY_NAV,
  ...MORE_NAV.map((m) => ({ label: m.label, href: m.href, icon: m.icon })),
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const userName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Founder";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userInitial = (userName[0] || "F").toUpperCase();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; read: boolean; createdAt: string }[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts({ onHelp: () => setHelpOpen((v) => !v) });

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setNotifications(j.data || []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const isMoreActive = MORE_NAV.some((m) => pathname.startsWith(m.href));

  return (
    <div className="dashboard-theme min-h-screen font-sans grain-overlay relative">
      <OrbField />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b border-border">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
            
            {/* Left: Brand & Workspace */}
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue to-purple opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-[1.5px] rounded-[6.5px] bg-[var(--dash-bg)] flex items-center justify-center">
                    <span className="text-blue font-bold text-xs">P</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-[var(--dash-text-primary)] tracking-tight hidden sm:block">
                  PoD Engine
                </span>
              </Link>

              <div className="h-4 w-px bg-border hidden sm:block" />

              <WorkspaceSwitcher />
            </div>

            {/* Center: Oval Translucent Glass Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-surface-elevated/40 dark:bg-surface-elevated/20 backdrop-blur-md p-1 rounded-full border border-border/70 shadow-xs">
              {PRIMARY_NAV.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                      active
                        ? "text-[var(--dash-text-primary)] font-semibold"
                        : "text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)] hover:bg-surface-elevated/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-surface/85 dark:bg-white/10 backdrop-blur-md border border-border/80 dark:border-white/15 shadow-xs"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={cn(
                    "relative flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                    isMoreActive
                      ? "text-[var(--dash-text-primary)] font-semibold"
                      : "text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)] hover:bg-surface-elevated/50"
                  )}
                >
                  <span className="relative z-10">More</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform relative z-10", moreOpen && "rotate-180")} />
                  {isMoreActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-surface/85 dark:bg-white/10 backdrop-blur-md border border-border/80 dark:border-white/15 shadow-xs"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 glass-strong rounded-2xl shadow-2xl p-1.5 z-50 border border-border"
                    >
                      <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                        Additional Tools
                      </div>
                      {MORE_NAV.map((m) => {
                        const active = isActive(m.href);
                        const Icon = m.icon;
                        return (
                          <Link
                            key={m.href}
                            href={m.href}
                            onClick={() => setMoreOpen(false)}
                            className={cn(
                              "flex items-start gap-2.5 px-2.5 py-2 rounded-xl transition-colors text-left",
                              active
                                ? "bg-blue/10 text-blue font-semibold"
                                : "text-[var(--dash-text-secondary)] hover:bg-surface-elevated hover:text-[var(--dash-text-primary)]"
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-medium leading-tight">{m.label}</p>
                              <p className="text-[10px] text-text-tertiary leading-tight mt-0.5">{m.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right: Quick Utilities */}
            <div className="flex items-center gap-2">
              <CommandPalette />

              <div className="h-4 w-px bg-border hidden sm:block mx-0.5" />

              <ThemeToggle />

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)] hover:bg-surface-elevated transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue text-white text-[9px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-2xl shadow-2xl py-2 z-50 border border-border max-h-[380px] overflow-auto"
                    >
                      <div className="flex items-center justify-between px-3 pb-2 border-b border-border">
                        <span className="text-sm font-semibold">Notifications</span>
                        {unread > 0 && (
                          <button onClick={markAllRead} className="text-[11px] text-blue hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-xs text-text-tertiary text-center py-8">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-3 py-2.5 hover:bg-surface-elevated border-b border-border/50 last:border-0 ${
                              !n.read ? "bg-blue/5" : ""
                            }`}
                          >
                            <p className="text-xs font-medium">{n.title}</p>
                            <p className="text-[11px] text-text-secondary line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-text-tertiary mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Profile */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white text-xs font-bold">
                    {userInitial}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-3 h-3 text-[var(--dash-text-tertiary)] transition-transform",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-2xl shadow-2xl py-1.5 z-50 border border-border"
                    >
                      <div className="px-3 py-2.5 border-b border-border mb-1">
                        <p className="text-sm font-semibold text-[var(--dash-text-primary)]">{userName}</p>
                        <p className="text-[11px] text-[var(--dash-text-tertiary)] truncate">{userEmail}</p>
                      </div>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--dash-text-secondary)] hover:bg-surface-elevated hover:text-[var(--dash-text-primary)] transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <Link
                        href="/dashboard/team"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--dash-text-secondary)] hover:bg-surface-elevated hover:text-[var(--dash-text-primary)] transition-colors"
                      >
                        <User className="w-4 h-4" /> Team
                      </Link>
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={() => signOut({ redirectUrl: "/" })}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red hover:bg-red/10 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg text-[var(--dash-text-tertiary)] hover:bg-surface-elevated"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden glass border-b border-border px-4 py-4"
            >
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_MOBILE_NAV.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-blue/10 text-blue font-semibold"
                          : "text-[var(--dash-text-secondary)] hover:bg-surface-elevated"
                      )}
                    >
                      <Icon className="w-4 h-4" /> {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
        <ShortcutHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </div>
  );
}
