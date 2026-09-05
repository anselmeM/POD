"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { User, Shield, AlertCircle, Plug, Users, History, HelpCircle, ArrowRight } from "lucide-react";

function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-surface rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  const [workspace, setWorkspace] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({ email: true, experiment: true, weekly: false });

  // Fetch live workspace from API
  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => {
        const ws = j.data?.[0] ?? null;
        if (ws) {
          setWorkspace(ws);
          setWorkspaceName(ws.name);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveWorkspace = async () => {
    if (!workspace?.id || !workspaceName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update workspace");
      }
      const json = await res.json();
      setWorkspace(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace?.id) return;
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete workspace");
      }
      setDeleteOpen(false);
      router.push("/onboarding");
    } catch (e) {
      setError((e as Error).message);
      setDeleteOpen(false);
    }
  };

  const fullName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
  const primaryEmail = user?.primaryEmailAddress?.emailAddress || "user@example.com";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-text-secondary">Manage your workspace and personal account settings.</p>
      </div>

      {/* Operations & Secondary Tools Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Link
          href="/dashboard/settings/integrations"
          className="p-3 rounded-xl bg-surface-elevated border border-border hover:border-blue/40 transition-colors group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-text-tertiary mb-2">
            <Plug className="w-4 h-4 text-blue" />
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Integrations</p>
            <p className="text-[10px] text-text-tertiary">Pixels, GA4 & Stripe</p>
          </div>
        </Link>

        <Link
          href="/dashboard/team"
          className="p-3 rounded-xl bg-surface-elevated border border-border hover:border-blue/40 transition-colors group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-text-tertiary mb-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Team & Roles</p>
            <p className="text-[10px] text-text-tertiary">Members & RBAC</p>
          </div>
        </Link>

        <Link
          href="/dashboard/history/activity"
          className="p-3 rounded-xl bg-surface-elevated border border-border hover:border-blue/40 transition-colors group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-text-tertiary mb-2">
            <History className="w-4 h-4 text-purple-400" />
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Audit Log</p>
            <p className="text-[10px] text-text-tertiary">Event timeline</p>
          </div>
        </Link>

        <Link
          href="/dashboard/help"
          className="p-3 rounded-xl bg-surface-elevated border border-border hover:border-blue/40 transition-colors group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-text-tertiary mb-2">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Help & Docs</p>
            <p className="text-[10px] text-text-tertiary">Keys & guides</p>
          </div>
        </Link>
      </div>

      {error && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Account (Live Clerk Profile) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>Your personal credentials authenticated via Clerk.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-elevated border border-border">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={fullName} className="w-12 h-12 rounded-full border border-border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue/20 text-blue font-bold flex items-center justify-center text-lg">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{fullName}</p>
              <p className="text-xs text-text-secondary">{primaryEmail}</p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-green font-medium">
                <Shield className="w-3 h-3" />
                Verified Account
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => openUserProfile?.()}>
            Manage Profile & Security in Clerk
          </Button>
        </CardContent>
      </Card>

      {/* Workspace (Live Database Model) */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Configure your active validation workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 bg-surface-elevated rounded-lg" />
              <div className="h-6 bg-surface-elevated rounded w-1/3" />
            </div>
          ) : (
            <>
              <Input
                label="Workspace Name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="My Startup Workspace"
              />
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  <p className="text-xs text-text-tertiary">Active tier</p>
                </div>
                <Badge variant="blue" className="capitalize">
                  {workspace?.plan || "Trial"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSaveWorkspace} disabled={saving || !workspaceName.trim()}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const res = await fetch("/api/stripe/portal", { method: "POST" });
                    const json = await res.json();
                    if (json.url) window.location.href = json.url;
                  }}
                >
                  Manage Billing
                </Button>
              </div>
              {saved && <p className="text-sm text-green font-medium">Workspace updated successfully.</p>}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what you get notified about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email" as const, label: "Email notifications", desc: "Receive email alerts for important events." },
            { key: "experiment" as const, label: "Experiment updates", desc: "Notify when experiments reach significance." },
            { key: "weekly" as const, label: "Weekly digest", desc: "Receive a weekly validation summary every Monday." },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-text-tertiary">{n.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications((p) => ({ ...p, [n.key]: !p[n.key] }))}
                className={
                  "relative w-11 h-6 rounded-full transition-colors " +
                  (notifications[n.key] ? "bg-blue" : "bg-surface-elevated border border-border")
                }
              >
                <span
                  className={
                    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform " +
                    (notifications[n.key] ? "translate-x-5" : "")
                  }
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Webhooks, Slack, Zapier, and FirstMileDevs API.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary mb-3">Configure webhooks to stream experiment events to your stack.</p>
          <a
            href="/dashboard/settings/integrations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border text-sm hover:bg-surface transition-colors"
          >
            Manage Webhooks & Integrations →
          </a>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red/20">
        <CardHeader>
          <CardTitle className="text-red">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary mb-4">
            Delete this workspace and all associated experiments, leads, and tracking data. This cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete Workspace
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Workspace"
        description={`Are you sure you want to delete "${workspace?.name || "this workspace"}"? All experiments and signals will be permanently removed.`}
        onConfirm={handleDeleteWorkspace}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}