"use client";

import { create } from "zustand";
import type { Experiment, ExperimentStatus, LandingPage, LandingPageStatus, Lead, LeadStatus } from "./types";

export interface WizardState {
  step: number;
  productName: string;
  oneLiner: string;
  problem: string;
  alternatives: string;
  expectedPrice: string;
  businessModel: string;
  description: string;
  selectedHypotheses: string[];
  audienceConfig: Record<string, string>;
  selectedVariants: string[];
  budget: number;
  channel: string[];
  setStep: (step: number) => void;
  updateField: (field: string, value: string | number | string[]) => void;
  toggleHypothesis: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  createProject: () => Promise<{ projectId: string; experimentId: string }>;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  step: 1,
  productName: "AI Reporting Copilot",
  oneLiner: "AI-generated weekly operational reports for SaaS teams",
  problem: "Operations managers spend 4-8 hours per week manually compiling reports",
  alternatives: "Manual spreadsheets, BI tools, hiring analysts",
  expectedPrice: "$49-99/month",
  businessModel: "SaaS subscription",
  description: "An AI assistant that automatically prepares weekly operational reports for growing SaaS teams by connecting to their existing tools.",
  selectedHypotheses: ["hyp-001"],
  audienceConfig: {},
  selectedVariants: [],
  budget: 100,
  channel: ["linkedin", "meta"],
  setStep: (step) => set({ step }),
  updateField: (field, value) => set((s) => ({ ...s, [field]: value })),
  toggleHypothesis: (id) =>
    set((s) => ({
      selectedHypotheses: s.selectedHypotheses.includes(id)
        ? s.selectedHypotheses.filter((h) => h !== id)
        : [...s.selectedHypotheses, id],
    })),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 6) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  reset: () => set({ step: 1, productName: "", oneLiner: "", problem: "", alternatives: "", expectedPrice: "", businessModel: "", description: "", selectedHypotheses: [], audienceConfig: {}, selectedVariants: [], budget: 100, channel: [] }),
  createProject: async () => {
    const state = get();
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: state.productName,
        oneLiner: state.oneLiner,
        description: state.description,
        problem: state.problem,
        alternatives: state.alternatives,
        expectedPrice: state.expectedPrice,
        businessModel: state.businessModel,
        audienceConfig: state.audienceConfig,
        budget: state.budget,
        channel: state.channel,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create project");
    }
    const json = await res.json();
    return { projectId: json.project.id, experimentId: json.experiment.id };
  },
}));

interface SidebarState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
  setMobileOpen: (open) => set({ mobileOpen: open }),
}));

// ============================================================
// Landing Page Store — backed by /api/landing-pages (Prisma DB)
// ============================================================

export interface LandingPageStore {
  landingPages: LandingPage[];
  loading: boolean;
  error: string | null;
  fetchLandingPages: () => Promise<void>;
  addLandingPage: (page: Omit<LandingPage, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateLandingPage: (id: string, updates: Partial<LandingPage>) => Promise<void>;
  deleteLandingPage: (id: string) => Promise<void>;
  updateLandingPageStatus: (id: string, status: LandingPageStatus) => Promise<void>;
}

export const useLandingPageStore = create<LandingPageStore>((set, get) => ({
  landingPages: [],
  loading: false,
  error: null,

  fetchLandingPages: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/landing-pages");
      const json = await res.json();
      set({ landingPages: json.data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addLandingPage: async (page) => {
    const res = await fetch("/api/landing-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(page),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create landing page");
    }
    const json = await res.json();
    set((s) => ({ landingPages: [json.data, ...s.landingPages] }));
  },

  updateLandingPage: async (id, updates) => {
    const res = await fetch(`/api/landing-pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update landing page");
    }
    const json = await res.json();
    set((s) => ({
      landingPages: s.landingPages.map((lp) => (lp.id === json.data.id ? json.data : lp)),
    }));
  },

  deleteLandingPage: async (id) => {
    const res = await fetch(`/api/landing-pages/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete landing page");
    }
    set((s) => ({ landingPages: s.landingPages.filter((lp) => lp.id !== id) }));
  },

  updateLandingPageStatus: async (id, status) => {
    await get().updateLandingPage(id, { status });
  },
}));

// ============================================================
// Experiment Store — backed by /api/experiments (Prisma DB)
// ============================================================

export interface ExperimentStore {
  experiments: Experiment[];
  loading: boolean;
  error: string | null;
  fetchExperiments: (projectId?: string) => Promise<void>;
  addExperiment: (experiment: Omit<Experiment, "variants" | "traffic" | "conversions" | "conversionRate" | "highIntentActions" | "highIntentRate" | "costPerAction"> & { channel?: string[] }) => Promise<void>;
  updateExperiment: (id: string, updates: Partial<Experiment>) => Promise<void>;
  deleteExperiment: (id: string) => Promise<void>;
  updateExperimentStatus: (id: string, status: ExperimentStatus) => Promise<void>;
}

export const useExperimentStore = create<ExperimentStore>((set, get) => ({
  experiments: [],
  loading: false,
  error: null,

  fetchExperiments: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const url = projectId ? `/api/experiments?projectId=${projectId}` : "/api/experiments";
      const res = await fetch(url);
      const json = await res.json();
      set({ experiments: json.data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addExperiment: async (experiment) => {
    const res = await fetch("/api/experiments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(experiment),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create experiment");
    }
    const json = await res.json();
    set((s) => ({ experiments: [json.data, ...s.experiments] }));
  },

  updateExperiment: async (id, updates) => {
    const res = await fetch(`/api/experiments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update experiment");
    }
    const json = await res.json();
    set((s) => ({
      experiments: s.experiments.map((exp) => (exp.id === json.data.id ? json.data : exp)),
    }));
  },

  deleteExperiment: async (id) => {
    const res = await fetch(`/api/experiments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete experiment");
    }
    set((s) => ({ experiments: s.experiments.filter((exp) => exp.id !== id) }));
  },

  updateExperimentStatus: async (id, status) => {
    await get().updateExperiment(id, { status });
  },
}));

// ============================================================
// Lead Store — backed by /api/leads (Prisma DB)
// ============================================================

export interface LeadStore {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  fetchLeads: (experimentId?: string) => Promise<void>;
  addLead: (lead: Omit<Lead, "createdAt">) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
}

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  loading: false,
  error: null,

  fetchLeads: async (experimentId) => {
    set({ loading: true, error: null });
    try {
      const url = experimentId ? `/api/leads?experimentId=${experimentId}` : "/api/leads";
      const res = await fetch(url);
      const json = await res.json();
      set({ leads: json.data, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  addLead: async (lead) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create lead");
    }
    const json = await res.json();
    set((s) => ({ leads: [json.data, ...s.leads] }));
  },

  updateLead: async (id, updates) => {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update lead");
    }
    const json = await res.json();
    set((s) => ({
      leads: s.leads.map((lead) => (lead.id === json.data.id ? json.data : lead)),
    }));
  },

  deleteLead: async (id) => {
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete lead");
    }
    set((s) => ({ leads: s.leads.filter((lead) => lead.id !== id) }));
  },

  updateLeadStatus: async (id, status) => {
    await get().updateLead(id, { status });
  },
}));