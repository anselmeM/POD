"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoWorkspace } from "@/lib/mock-data";

function ConfirmDialog({ open, title, description, onConfirm, onCancel }: {
  open: boolean; title: string; description: string; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-surface rounded-2xl border border-border p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, experiment: true, weekly: false });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-text-secondary">Manage your workspace and account settings.</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader><CardTitle>Account</CardTitle><CardDescription>Your personal account details.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full Name" defaultValue="Alex Morgan" />
          <Input label="Email" type="email" defaultValue="alex@podengine.com" />
          <Input label="New Password" type="password" placeholder="Leave blank to keep current" />
          <Button onClick={handleSave}>Save Changes</Button>
          {saved && <p className="text-sm text-green font-medium">Settings saved successfully.</p>}
        </CardContent>
      </Card>

      {/* Workspace */}
      <Card>
        <CardHeader><CardTitle>Workspace</CardTitle><CardDescription>Manage your workspace configuration.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Workspace Name" defaultValue={demoWorkspace.name} />
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Plan</p><p className="text-xs text-text-tertiary">Current subscription tier</p></div>
            <Badge variant="blue">{demoWorkspace.plan}</Badge>
          </div>
          <Button variant="secondary" onClick={async () => {
            const res = await fetch("/api/stripe/portal", { method: "POST" });
            const json = await res.json();
            if (json.url) window.location.href = json.url;
          }}>Manage Billing</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Choose what you get notified about.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: "email" as const, label: "Email notifications", desc: "Receive email alerts for important events." },
            { key: "experiment" as const, label: "Experiment updates", desc: "Notify when experiments reach significance." },
            { key: "weekly" as const, label: "Weekly digest", desc: "Receive a weekly summary every Monday." },
          ]).map((n) => (
            <div key={n.key} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{n.label}</p><p className="text-xs text-text-tertiary">{n.desc}</p></div>
              <button
                onClick={() => setNotifications((p) => ({ ...p, [n.key]: !p[n.key] }))}
                className={"relative w-11 h-6 rounded-full transition-colors " + (notifications[n.key] ? "bg-blue" : "bg-gray-200")}
              >
                <span className={"absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform " + (notifications[n.key] ? "translate-x-5" : "")} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Integrations</CardTitle><CardDescription>Webhooks, Slack, Zapier, and FirstMileDevs API.</CardDescription></CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary mb-3">Configure webhooks to receive experiment events.</p>
          <a href="/dashboard/settings/integrations" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-border text-sm hover:bg-surface transition-colors">Manage Integrations →</a>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader><CardTitle>Danger Zone</CardTitle><CardDescription>Irreversible actions.</CardDescription></CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary mb-4">Delete this workspace and all associated data. This cannot be undone.</p>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>Delete Workspace</Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Workspace"
        description={"Are you sure you want to delete \"" + demoWorkspace.name + "\"? All experiments, audiences, and data will be permanently removed."}
        onConfirm={() => { setDeleteOpen(false); }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}