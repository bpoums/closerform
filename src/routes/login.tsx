import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { roleHome, useAuth, type AppRole } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in | UMS BPO Ops" },
      {
        name: "description",
        content: "Sign in to the UMS BPO operations console for closers, managers, validators and admins.",
      },
      { property: "og:title", content: "Sign in | UMS BPO Ops" },
      {
        property: "og:description",
        content: "Sign in to the UMS BPO operations console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { profile, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session && profile) {
      navigate({ to: roleHome[profile.role], replace: true });
    }
  }, [session, profile, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError || !data.user) {
      setError(signInError?.message ?? "Could not sign in.");
      setBusy(false);
      return;
    }
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    const role = (prof?.role as AppRole | undefined) ?? "closer";
    navigate({ to: roleHome[role], replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <form onSubmit={handleSubmit} className="panel w-full max-w-sm">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-accent">
          UMS BPO
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">Ops console</h1>
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
            />
          </div>
          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
          <button type="submit" className="btn-submit mt-1" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </main>
  );
}
