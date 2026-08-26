"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ChevronDown, Menu, X,
  LogOut, Settings, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV } from "@/lib/constants";
import { DEMO_USER } from "@/lib/constants";
import { OrbField } from "@/components/ui/animated-orb";
import { CommandPalette } from "@/components/ui/command-palette";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ShortcutHelp } from "@/components/ui/shortcut-help";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSession, signOut } from "next-auth/react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name || DEMO_USER.name;
  const userEmail = session?.user?.email || DEMO_USER.email;
  const userInitial = (userName[0] || DEMO_USER.initials).toUpperCase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; read: boolean; createdAt: string }[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    fetch("/api/notifications").then((r) => r.ok ? r.json() : { data: [] }).then((j) => setNotifications(j.data || [])).catch(() => {});
  }, [session]);
  useEffect(() => {
    function onClickOutside(e: MouseEvent) { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false); }
    if (notifOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [notifOpen]);
  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  useKeyboardShortcuts({ onHelp: () => setHelpOpen((v) => !v) });
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="dashboard-theme min-h-screen font-sans grain-overlay relative">
      <OrbField />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b border-[#F3F4F6]">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                <div className="relative w-9 h-9">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue to-purple opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-[2px] rounded-[10px] bg-[var(--dash-bg)] flex items-center justify-center">
                    <span className="text-blue font-bold text-sm">P</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-[var(--dash-text-primary)] tracking-tight hidden sm:block">PoD Engine</span>
              </Link>
              <WorkspaceSwitcher />

              <nav className="hidden lg:flex items-center gap-0.5">
                  {DASHBOARD_NAV.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn(
                        "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                        active ? "text-[var(--dash-text-primary)] bg-[#E5E7EB]" : "text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)] hover:bg-[#F8F9FA]"
                      )}>
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                      {active && (
                        <motion.div layoutId="nav-indicator"
                          className="absolute inset-0 rounded-lg bg-[#E5E7EB] border border-[#D1D5DB]"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }} />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>


            <div className="flex items-center gap-3">
              <CommandPalette />
              <ThemeToggle />
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)] hover:bg-[#F8F9FA] transition-colors">
                  <Bell className="w-4 h-4" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue text-white text-[9px] font-bold flex items-center justify-center">{unread}</span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl shadow-2xl py-2 z-50 border border-border max-h-[380px] overflow-auto">
                      <div className="flex items-center justify-between px-3 pb-2 border-b border-border">
                        <span className="text-sm font-semibold">Notifications</span>
                        {unread > 0 && <button onClick={markAllRead} className="text-[11px] text-blue hover:underline">Mark all read</button>}
                      </div>
                      {notifications.length === 0 ? <p className="text-xs text-text-tertiary text-center py-8">No notifications</p> : notifications.map((n) => (
                        <div key={n.id} className={`px-3 py-2.5 hover:bg-surface-elevated border-b border-border/50 last:border-0 ${!n.read ? "bg-blue/5" : ""}`}>
                          <p className="text-xs font-medium">{n.title}</p>
                          <p className="text-[11px] text-text-secondary line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-text-tertiary mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white text-xs font-bold">{userInitial}</div>
                  <ChevronDown className={cn("w-3 h-3 text-[var(--dash-text-tertiary)] transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-xl shadow-2xl shadow-black/40 py-1.5 z-50">
                      <div className="px-3 py-2.5 border-b border-[#F3F4F6] mb-1">
                        <p className="text-sm font-semibold text-[var(--dash-text-primary)]">{userName}</p>
                        <p className="text-[11px] text-[var(--dash-text-tertiary)]">{userEmail}</p>
                      </div>
                      <Link href="/dashboard/settings" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--dash-text-secondary)] hover:bg-[#F8F9FA] hover:text-[var(--dash-text-primary)] transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      <Link href="/dashboard/team" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--dash-text-secondary)] hover:bg-[#F8F9FA] hover:text-[var(--dash-text-primary)] transition-colors">
                        <User className="w-4 h-4" /> Team
                      </Link>
                      <div className="border-t border-[#F3F4F6] mt-1 pt-1">
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red hover:bg-red/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button className="lg:hidden p-2 rounded-lg text-[var(--dash-text-tertiary)] hover:bg-[#F8F9FA]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden">
              <div className="glass border-b border-[#F3F4F6] px-4 py-4">
                <div className="grid grid-cols-2 gap-1">
                {DASHBOARD_NAV.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                        className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                          active ? "bg-blue/10 text-blue" : "text-[var(--dash-text-secondary)] hover:bg-[#F8F9FA]"
                        )}>
                        <Icon className="w-4 h-4" /> {item.label}
                      </Link>
                    );
                  })}
                </div>
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

