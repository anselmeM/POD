"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FlaskConical, Layout, Users, Activity, Contact,
  Brain, FileText, Bell, Search, ChevronDown, Menu, X,
  LogOut, Settings, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Experiments", href: "/dashboard/experiments", icon: FlaskConical },
  { label: "Signals", href: "/dashboard/signals", icon: Activity },
  { label: "Audiences", href: "/dashboard/audiences", icon: Users },
  { label: "Leads", href: "/dashboard/leads", icon: Contact },
  { label: "AI Analyst", href: "/dashboard/ai-analyst", icon: Brain },
  { label: "Landing Pages", href: "/dashboard/landing-pages", icon: Layout },
  { label: "Reports", href: "/dashboard/reports", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifCount] = useState(7);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
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
    <div className="dashboard-theme min-h-screen font-sans">
      <div className="min-h-screen p-3 sm:p-5 md:p-8 flex justify-center">
        <div className="w-full max-w-[1440px] bg-[var(--dash-container)] rounded-[28px] sm:rounded-[36px] md:rounded-[40px] p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/60 flex flex-col">

          {/* Header */}
          <header className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6 lg:mb-8">
            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-[var(--dash-nav-active)] rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
              </Link>

              <nav className="hidden lg:flex bg-[var(--dash-nav-bg)] p-1.5 rounded-full items-center gap-1 shadow-inner">
                {NAV_SECTIONS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-4 xl:px-5 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap",
                        active
                          ? "bg-[var(--dash-nav-active)] text-white shadow-md"
                          : "text-gray-600 hover:text-black hover:bg-white/40"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-gray-100 text-gray-500 hover:text-gray-900">
                <Search className="w-[18px] h-[18px]" />
              </button>
              <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-gray-100 text-gray-500 hover:text-gray-900 relative">
                <Bell className="w-[18px] h-[18px]" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--dash-orange)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </button>
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-white rounded-full pl-1 pr-3 py-1 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">A</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 hidden sm:block">Alex</span>
                  <ChevronDown className={"w-3 h-3 text-gray-400 hidden sm:block transition-transform duration-200 " + (userMenuOpen ? "rotate-180" : "")} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900">Alex Morgan</p>
                        <p className="text-[11px] text-gray-400">alex@example.com</p>
                      </div>
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <Link
                        href="/dashboard/team"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Team
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link
                          href="/"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Mobile Nav */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden overflow-hidden mb-4"
              >
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 grid grid-cols-2 gap-1">
                  {NAV_SECTIONS.map((item) => {
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
                            ? "bg-[var(--dash-nav-active)] text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
