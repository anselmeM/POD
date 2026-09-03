"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Mail, Trash2, Shield, AlertCircle, RefreshCw } from "lucide-react";

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
}

export default function TeamPage() {
  const { user } = useUser();
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Fetch workspace and members
  const fetchTeamData = async () => {
    setLoading(true);
    setError(null);
    try {
      const wsRes = await fetch("/api/workspaces");
      if (!wsRes.ok) throw new Error("Failed to load workspace");
      const wsJson = await wsRes.json();
      const currentWs = wsJson.data?.[0];
      if (!currentWs) return;
      setWorkspace(currentWs);

      const memRes = await fetch(`/api/workspaces/${currentWs.id}/members`);
      if (memRes.ok) {
        const memJson = await memRes.json();
        setMembers(memJson.data || []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleInvite = async () => {
    if (!workspace?.id || !email.trim()) return;
    setInviting(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to invite member");
      }
      const json = await res.json();
      setMembers((prev) => [...prev, json.data]);
      setInviteSuccess(`Invitation sent to ${email}`);
      setEmail("");
      setTimeout(() => {
        setInviteSuccess(null);
        setShowInvite(false);
      }, 2500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!workspace?.id) return;
    if (!confirm("Are you sure you want to remove this member from the workspace?")) return;
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members?memberId=${memberId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to remove member");
      }
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-text-secondary">
            Manage workspace members and permissions for {workspace?.name || "your workspace"}.
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)} disabled={showInvite}>
          <Plus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {error && (
        <Card className="border-red/30 bg-red/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red" />
            <p className="text-sm text-red">{error}</p>
            <Button size="sm" variant="secondary" onClick={fetchTeamData} className="ml-auto">
              <RefreshCw className="w-3 h-3" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal / Card */}
      {showInvite && (
        <Card className="border-blue/30 bg-blue/[0.02]">
          <CardHeader>
            <CardTitle className="text-base">Invite Team Member</CardTitle>
            <CardDescription>Enter the email address of the person you want to collaborate with.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inviteSuccess ? (
              <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-green/10 text-green border border-green/20">
                <Mail className="w-4 h-4" />
                <span className="font-medium">{inviteSuccess}</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Input
                  placeholder="colleague@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "member" | "admin")}
                  className="bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-blue"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button onClick={handleInvite} disabled={inviting || !email.trim()}>
                    {inviting ? "Inviting..." : "Send Invite"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowInvite(false);
                      setEmail("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {members.length} {members.length === 1 ? "Member" : "Members"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-surface-elevated animate-pulse flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-border" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-border rounded w-1/4" />
                    <div className="h-3 bg-border rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((m) => {
                const isCurrent = user?.primaryEmailAddress?.emailAddress === m.email;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-surface-elevated/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {m.image ? (
                        <img src={m.image} alt={m.name} className="w-10 h-10 rounded-full border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue">{m.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-text-primary">{m.name}</p>
                          {isCurrent && (
                            <span className="text-[10px] bg-blue/10 text-blue font-bold px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-tertiary">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={m.role === "owner" ? "blue" : m.role === "admin" ? "purple" : "default"}>
                        {m.role === "owner" ? (
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Owner
                          </span>
                        ) : (
                          m.role
                        )}
                      </Badge>
                      {m.role !== "owner" && !isCurrent && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-tertiary hover:text-red transition-colors"
                          onClick={() => handleRemove(m.id)}
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}