import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  AppHeader,
  PayloadTable,
  StatusBadge,
  customerName,
  formatClock,
  relativeTime,
  remainingMs,
  useNow,
  type SubmissionRow,
} from "@/components/ops";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/manager")({
  head: () => ({
    meta: [
      { title: "Manager Queue | UMS BPO Ops" },
      {
        name: "description",
        content: "Review incoming closer submissions, assign them to validators and dispose them.",
      },
      { property: "og:title", content: "Manager Queue | UMS BPO Ops" },
      {
        property: "og:description",
        content: "Review incoming closer submissions and assign validators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManagerPage,
});

type ManagerRow = SubmissionRow & {
  closer: { full_name: string | null } | null;
  assignee: { full_name: string | null } | null;
  timeout_by: { full_name: string | null } | null;
};

const OPEN_STATUSES = ["pending_manager", "returned_timeout", "assigned", "in_review"];

function ManagerPage() {
  const queryClient = useQueryClient();
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);

  const submissions = useQuery({
    queryKey: ["manager", "submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select(
          "*, closer:profiles!submissions_closer_id_fkey(full_name), assignee:profiles!submissions_assigned_to_fkey(full_name), timeout_by:profiles!submissions_last_timeout_by_fkey(full_name)",
        )
        .in("status", OPEN_STATUSES)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ManagerRow[];
    },
  });

  const validators = useQuery({
    queryKey: ["validators"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "validator")
        .eq("active", true)
        .order("full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("manager-submissions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["manager", "submissions"] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const dispose = useMutation({
    mutationFn: async (vars: { id: string; disposition: "accepted" | "declined" }) => {
      const { error } = await supabase.rpc("dispose_submission", {
        p_sub: vars.id,
        p_disposition: vars.disposition,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(`Submission ${vars.disposition}`);
      setOpenId(null);
      queryClient.invalidateQueries({ queryKey: ["manager", "submissions"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const assign = useMutation({
    mutationFn: async (vars: { id: string; validator: string }) => {
      const { error } = await supabase.rpc("assign_to_validator", {
        p_sub: vars.id,
        p_validator: vars.validator,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Assigned to validator");
      setOpenId(null);
      queryClient.invalidateQueries({ queryKey: ["manager", "submissions"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = submissions.data ?? [];
  const selected = rows.find((row) => row.id === openId) ?? null;
  const busy = dispose.isPending || assign.isPending;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
        <AppHeader title="Manager Queue" subtitle="Manager" />

        <section className="panel">
          <h2 className="panel-title">Open submissions ({rows.length})</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Closer</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => setOpenId(row.id)}
                >
                  <TableCell className="font-medium">{customerName(row.payload)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.closer?.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {relativeTime(row.created_at, now)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {row.status === "returned_timeout" ? (
                        <Badge variant="destructive">
                          Unsubmitted by {row.timeout_by?.full_name ?? "validator"}
                        </Badge>
                      ) : (
                        <StatusBadge status={row.status} />
                      )}
                      {row.status === "in_review" ? (
                        <span className="text-xs text-muted-foreground">
                          {row.assignee?.full_name ?? "validator"} ·{" "}
                          <span className="font-semibold text-primary">
                            {formatClock(remainingMs(row.claimed_at, now))}
                          </span>
                        </span>
                      ) : null}
                      {row.status === "assigned" ? (
                        <span className="text-xs text-muted-foreground">
                          → {row.assignee?.full_name ?? "validator"}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {submissions.isLoading ? "Loading…" : "Nothing in the queue."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </section>
      </div>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{customerName(selected.payload)}</SheetTitle>
                <SheetDescription>
                  Submitted by {selected.closer?.full_name ?? "—"} ·{" "}
                  {relativeTime(selected.created_at, now)}
                </SheetDescription>
              </SheetHeader>
              <div className="px-4">
                <PayloadTable payload={selected.payload} />
              </div>
              <div className="flex flex-col gap-2 border-t border-border p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-submit flex-1"
                    disabled={busy}
                    onClick={() =>
                      dispose.mutate({ id: selected.id, disposition: "accepted" })
                    }
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="chip flex-1 justify-center border-destructive text-destructive"
                    disabled={busy}
                    onClick={() =>
                      dispose.mutate({ id: selected.id, disposition: "declined" })
                    }
                  >
                    Decline
                  </button>
                </div>
                <Select
                  onValueChange={(value) =>
                    assign.mutate({ id: selected.id, validator: value })
                  }
                  disabled={busy}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to validator" />
                  </SelectTrigger>
                  <SelectContent>
                    {(validators.data ?? []).map((validator) => (
                      <SelectItem key={validator.id} value={validator.id}>
                        {validator.full_name ?? validator.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </main>
  );
}
