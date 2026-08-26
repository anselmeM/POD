"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useKeyboardShortcuts(opts?: {
  onJ?: () => void;
  onK?: () => void;
  onHelp?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        opts?.onHelp?.();
      }
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (pathname.startsWith("/dashboard/experiments")) router.push("/dashboard/experiments/new");
        else if (pathname.startsWith("/dashboard/landing-pages")) router.push("/dashboard/landing-pages/new");
      }
      if (e.key === "j" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        opts?.onJ?.();
      }
      if (e.key === "k" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        opts?.onK?.();
      }
      if (e.key === "Escape") {
        // Let CommandPalette and dialogs handle Esc themselves via their own listeners
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, pathname, opts]);
}
