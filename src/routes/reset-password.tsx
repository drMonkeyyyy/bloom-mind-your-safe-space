import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password · Bloom Mind" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password berhasil diubah.");
    navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: "var(--gradient-hero)" }}>
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-card p-8 shadow-soft ring-1 ring-border">
        <h1 className="font-display text-2xl font-semibold">Set password baru</h1>
        <input type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)}
          placeholder="Password baru"
          className="mt-5 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        <button disabled={loading} className="mt-4 w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground">
          {loading ? "Menyimpan…" : "Simpan password"}
        </button>
      </form>
    </div>
  );
}
