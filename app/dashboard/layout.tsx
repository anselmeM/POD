"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, ChevronDown, Menu, X,
  LogOut, Settings, User, CreditCard,
  LayoutDashboard, FlaskConical, Layout, Activity, Brain,
  Users, Contact, FileText, Zap, History, Check, Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrbField } from "@/components/ui/animated-orb";
import { CommandPalette } from "@/components/ui/command-palette";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ShortcutHelp } from "@/components/ui/shortcut-help";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useUser, useClerk } from "@clerk/nextjs";

// 4 Core Validation Pillars
const PRIMARY_NAV = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Experiments", href: "/dashboard/experiments", icon: FlaskConical },
  { label: "Demand", href: "/dashboard/leads", icon: Contact },
  { label: "AI Verdict", href: "/dashboard/ai-analyst", icon: Brain },
];

// Secondary / Specialized features & operations in 'More' dropdown
const MORE_NAV = [
  { label: "Traffic & Ad Kit", href: "/dashboard/traffic", icon: Megaphone, desc: "Multi-channel ad copy & 1-click UTM builder" },
  { label: "Sprint Mode", href: "/dashboard?view=sprint", icon: Zap, desc: "7-day sprint countdown & lead quota" },
  { label: "Live Pages", href: "/dashboard/experiments?view=pages", icon: Layout, desc: "Published smoke pages & copy variants" },
  { label: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard, desc: "Subscription tiers & resource quotas" },
  { label: "Team", href: "/dashboard/team", icon: Users, desc: "Manage collaborators & permissions" },
  { label: "Activity Log", href: "/dashboard/history/activity", icon: History, desc: "Audit trail & event timeline" },
];


const ALL_MOBILE_NAV = [
  ...PRIMARY_NAV,
  ...MORE_NAV.map((m) => ({ label: m.label, href: m.href, icon: m.icon })),
];

interface DashboardNotification {
  id: string;
  type?: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function formatNotificationTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getNotificationIcon(type?: string) {
  const t = type?.toLowerCase() || "";
  if (t.includes("experiment")) {
    return {
      icon: FlaskConical,
      badgeClass: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
    };
  }
  if (t.includes("lead")) {
    return {
      icon: Contact,
      badgeClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    };
  }
  if (t.includes("insight") || t.includes("ai")) {
    return {
      icon: Brain,
      badgeClass: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    };
  }
  if (t.includes("sprint")) {
    return {
      icon: Zap,
      badgeClass: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    };
  }
  return {
    icon: Bell,
    badgeClass: "bg-surface-elevated text-[var(--dash-text-secondary)] border border-border",
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const userName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Founder";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userInitial = (userName[0] || "F").toUpperCase();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts({ onHelp: () => setHelpOpen((v) => !v) });

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setNotifications(j.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {});
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearAll: true }),
    }).catch(() => {});
  };

  const handleNotificationClick = (notif: DashboardNotification) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setNotifOpen(false);

    const t = notif.type?.toLowerCase() || "";
    if (t.includes("experiment")) {
      router.push("/dashboard/experiments");
    } else if (t.includes("lead")) {
      router.push("/dashboard/leads");
    } else if (t.includes("insight") || t.includes("ai")) {
      router.push("/dashboard/ai-analyst");
    } else if (t.includes("sprint")) {
      router.push("/dashboard?view=sprint");
    } else if (t.includes("audience")) {
      router.push("/dashboard/leads?tab=attribution");
    } else if (t.includes("page") || t.includes("landing")) {
      router.push("/dashboard/experiments?view=pages");
    } else if (t.includes("signal")) {
      router.push("/dashboard/leads?tab=signals");
    } else if (t.includes("report")) {
      router.push("/dashboard/ai-analyst?export=ready");
    } else {
      router.push("/dashboard");
    }
  };

  const isActive = (href: string) => {
    const cleanHref = href.split("?")[0];
    if (cleanHref === "/dashboard") return pathname === "/dashboard";
    if (cleanHref === "/dashboard/leads") {
      return (
        pathname.startsWith("/dashboard/leads") ||
        pathname.startsWith("/dashboard/signals") ||
        pathname.startsWith("/dashboard/audiences")
      );
    }
    if (cleanHref === "/dashboard/experiments") {
      return (
        pathname.startsWith("/dashboard/experiments") ||
        pathname.startsWith("/dashboard/landing-pages") ||
        pathname.startsWith("/dashboard/firstmile")
      );
    }
    if (cleanHref === "/dashboard/ai-analyst") {
      return pathname.startsWith("/dashboard/ai-analyst") || pathname.startsWith("/dashboard/reports");
    }
    return pathname.startsWith(cleanHref);
  };

  const isMoreActive = MORE_NAV.some((m) => {
    const clean = m.href.split("?")[0];
    if (clean === "/dashboard" || clean === "/dashboard/experiments") return false;
    return pathname.startsWith(clean);
  });

  return (
    <div className="dashboard-theme min-h-screen font-sans grain-overlay relative">
      <OrbField />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 glass border-b border-border">
          <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 lg:gap-4">
            
            {/* Left: Brand & Workspace */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              <Link href="/dashboard" className="flex items-center group shrink-0" title="PoD Engine">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue to-purple opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-[1.5px] rounded-[6.5px] bg-[var(--dash-bg)] flex items-center justify-center">
                    <span className="text-blue font-bold text-xs">P</span>
                  </div>
                </div>
              </Link>

              <div className="h-4 w-px bg-border" />

              <WorkspaceSwitcher />
            </div>

            {/* Center: Oval Translucent Glass Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-0.5 bg-surface-elevated/50 dark:bg-surface-elevated/30 backdrop-blur-md p-1 rounded-full border border-border/80 shadow-xs shrink-0">
              {PRIMARY_NAV.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-1.5 px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                      active
                        ? "text-[var(--dash-text-primary)] font-semibold"
                        : "text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-secondary)] hover:bg-surface-elevated/50"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 relative z-10 shrink-0" />
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
                    "relative flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
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
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <CommandPalette />

              <div className="h-4 w-px bg-border hidden xl:block mx-0.5" />

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
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-strong rounded-2xl shadow-2xl z-50 border border-border overflow-hidden flex flex-col max-h-[440px]"
                    >
                      {/* Dropdown Header */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border bg-surface-elevated/40">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--dash-text-primary)]">Notifications</span>
                          {unread > 0 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue text-white leading-none">
                              {unread} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5">
                          {unread > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-[11px] font-medium text-blue hover:underline cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-[11px] text-[var(--dash-text-tertiary)] hover:text-red-400 transition-colors cursor-pointer"
                              title="Clear all"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Content */}
                      <div className="overflow-y-auto divide-y divide-border/40">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-10 text-center flex flex-col items-center justify-center">
                            <div className="w-9 h-9 rounded-full bg-surface-elevated flex items-center justify-center text-[var(--dash-text-tertiary)] mb-2.5">
                              <Bell className="w-4 h-4 opacity-50" />
                            </div>
                            <p className="text-xs font-medium text-[var(--dash-text-primary)]">All caught up!</p>
                            <p className="text-[11px] text-[var(--dash-text-tertiary)] mt-0.5 max-w-[200px]">
                              No notifications right now. System events and conversion alerts will appear here.
                            </p>
                          </div>
                        ) : (
                          notifications.map((n) => {
                            const { icon: IconComp, badgeClass } = getNotificationIcon(n.type);
                            return (
                              <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={cn(
                                  "group relative flex items-start gap-3 p-3 transition-colors cursor-pointer select-none",
                                  n.read
                                    ? "hover:bg-surface-elevated/60 opacity-80 hover:opacity-100"
                                    : "bg-blue/5 hover:bg-blue/10"
                                )}
                              >
                                {/* Unread indicator pip */}
                                {!n.read && (
                                  <span className="absolute left-1.5 top-4 w-1.5 h-1.5 rounded-full bg-blue ring-2 ring-blue/20" />
                                )}

                                {/* Contextual Icon */}
                                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", badgeClass)}>
                                  <IconComp className="w-3.5 h-3.5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <p className={cn("text-xs leading-tight truncate", !n.read ? "font-semibold text-[var(--dash-text-primary)]" : "font-medium text-[var(--dash-text-secondary)]")}>
                                      {n.title}
                                    </p>
                                    <span className="text-[10px] text-[var(--dash-text-tertiary)] shrink-0 whitespace-nowrap ml-1">
                                      {formatNotificationTime(n.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[var(--dash-text-secondary)] line-clamp-2 leading-snug">
                                    {n.message}
                                  </p>
                                </div>

                                {/* Dismiss button */}
                                <button
                                  onClick={(e) => deleteNotification(n.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[var(--dash-text-tertiary)] hover:text-[var(--dash-text-primary)] hover:bg-surface-elevated transition-all shrink-0 cursor-pointer"
                                  title="Dismiss notification"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
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
                        href="/dashboard/billing"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--dash-text-secondary)] hover:bg-surface-elevated hover:text-[var(--dash-text-primary)] transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-blue" /> Billing & Plans
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
