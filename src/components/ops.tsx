import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export type SubStatus =
  | "pending_manager"
  | "assigned"
  | "in_review"
  | "returned_timeout"
  | "closed";

export type SubmissionRow = {
  id: string;
  closer_id: string;
  payload: Record<string, unknown>;
  status: SubStatus;
  assigned_to: string | null;
  assigned_at: string | null;
  claimed_at: string | null;
  last_timeout_by: string | null;
  timeout_count: number;
  disposition: "accepted" | "declined" | null;
  disposed_by: string | null;
  disposed_at: string | null;
  created_at: string;
};

export const REVIEW_WINDOW_MS = 10 * 60 * 1000;

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function relativeTime(iso: string, now: number) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function remainingMs(claimedAt: string | null, now: number) {
  if (!claimedAt) return 0;
  return new Date(claimedAt).getTime() + REVIEW_WINDOW_MS - now;
}

export function customerName(payload: Record<string, unknown>) {
  const value = payload?.["Full Name"];
  return typeof value === "string" && value.trim() ? value : "—";
}

const STATUS_LABEL: Record<SubStatus, string> = {
  pending_manager: "Pending",
  assigned: "Assigned",
  in_review: "In review",
  returned_timeout: "Returned",
  closed: "Closed",
};

export function StatusBadge({ status }: { status: SubStatus }) {
  const variant =
    status === "returned_timeout"
      ? "destructive"
      : status === "in_review"
        ? "default"
        : "secondary";
  return <Badge variant={variant}>{STATUS_LABEL[status]}</Badge>;
}

export function PayloadTable({ payload }: { payload: Record<string, unknown> }) {
  const entries = Object.entries(payload ?? {});
  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-2 px-3 py-1.5">
          <span className="field-label truncate">{key}</span>
          <span className="text-xs text-foreground break-words">
            {value === null || value === undefined || value === "" ? "—" : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { profile, signOut } = useAuth();
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-accent">
          UMS BPO {subtitle ? `· ${subtitle}` : ""}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {profile?.full_name ?? "Signed in"}
          {profile ? ` · ${profile.role}` : ""}
        </span>
        <button type="button" className="chip" onClick={signOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
