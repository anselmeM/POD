"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { BRAND, NAV_ITEMS } from "@/lib/constants";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue to-purple opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-[2px] rounded-[6px] bg-background flex items-center justify-center">
              <span className="text-blue font-bold text-sm">P</span>
            </div>
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">
            {BRAND.shortName}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors group"
            >
              {item.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-blue group-hover:w-4/5 transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <Show when="signed-out">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <MagneticButton strength={0.2}>
              <Link href="/sign-up">
                <Button size="sm" className="group">
                  Start Validation
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </MagneticButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <Button size="sm" variant="ghost" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <UserButton />
          </Show>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-text-secondary"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="md:hidden glass border-t border-white/[0.06]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-1">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className="block text-sm text-text-secondary hover:text-text-primary py-3 px-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-4 border-t border-white/[0.06] flex flex-col gap-2">
                <Show when="signed-out">
                  <Link href="/sign-in" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setOpen(false)}>
                    <Button className="w-full">
                      Start Validation
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </Show>
                <Show when="signed-in">
                  <Link href="/dashboard" onClick={() => setOpen(false)}>
                    <Button className="w-full gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Open Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 pt-2 px-2">
                    <UserButton />
                    <span className="text-sm text-text-secondary">My Account</span>
                  </div>
                </Show>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}