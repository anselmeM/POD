"use client";
import { motion, AnimatePresence } from "framer-motion";

export function ShortcutHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 8 }} className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-border p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-4">Keyboard shortcuts</h3>
            <div className="space-y-2 text-xs">
              {[
                ["⌘ K", "Global search"],
                ["J / K", "Next / previous item"],
                ["Enter", "Open selected"],
                ["N", "New experiment / page"],
                ["?", "This help"],
                ["Esc", "Close dialog"],
              ].map(([k, d]) => (
                <div key={k} className="flex items-center justify-between"><span className="px-1.5 py-0.5 rounded bg-surface-elevated border border-border font-mono text-[10px]">{k}</span><span className="text-text-secondary">{d}</span></div>
              ))}
            </div>
            <button onClick={onClose} className="mt-4 w-full py-2 rounded-lg bg-surface-elevated border border-border text-sm">Close</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
