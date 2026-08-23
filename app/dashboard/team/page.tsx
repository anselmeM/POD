"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { demoWorkspace } from "@/lib/mock-data";
import { Plus, X, Mail } from "lucide-react";

export default function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleInvite() {
    if (!email.trim()) return;
    setSent(true);
    setTimeout(() => {
      setShowInvite(false);
      setEmail("");
      setSent(false);
    }, 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Team</h1><p className="text-sm text-text-secondary">Manage your workspace members.</p></div>
        <Button onClick={() => setShowInvite(true)}><Plus className="w-4 h-4" />Invite Member</Button>
      </div>

      {showInvite && (
        <Card className="border-blue/30">
          <CardContent className="p-4">
            {sent ? (
              <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-green" /><span className="text-green font-medium">Invitation sent to {email}</span></div>
            ) : (
              <div className="flex items-center gap-3">
                <Input placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
                <Button onClick={handleInvite} disabled={!email.trim()}>Send Invite</Button>
                <Button variant="ghost" size="icon" onClick={() => { setShowInvite(false); setEmail(""); }}><X className="w-4 h-4" /></Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{demoWorkspace.members.length} Members</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demoWorkspace.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-surface-elevated/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue/20 flex items-center justify-center"><span className="text-sm font-semibold text-blue">{m.name.charAt(0)}</span></div>
                  <div><p className="text-sm font-medium">{m.name}</p><p className="text-xs text-text-tertiary">{m.email}</p></div>
                </div>
                <Badge variant={m.role === "owner" ? "blue" : "default"}>{m.role}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}