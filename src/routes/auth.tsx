import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({ mode: z.enum(["login","register","forgot"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Masuk · Bloom Mind" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "login" } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name }, emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Selamat datang di Bloom Mind 🌿");
        navigate({ to: "/app" });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Link reset password sudah dikirim ke email kamu.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally { setLoading(false); }
  };

  const google = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/app",
      },
    });
    if (error) {
      toast.error("Login Google gagal: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <div className="px-6 py-5">
        <Link to="/" className="font-display text-xl font-semibold text-foreground">Bloom Mind</Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-soft ring-1 ring-border">
          <h1 className="font-display text-3xl font-semibold text-foreground">
            {mode === "register" ? "Buat akun" : mode === "forgot" ? "Reset password" : "Selamat datang kembali"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "register" ? "Tempat aman untuk tumbuh dan memahami diri."
              : mode === "forgot" ? "Kami akan kirim link reset ke email kamu."
              : "Masuk untuk lanjutkan perjalananmu."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nama panggilan" required
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            )}
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            {mode !== "forgot" && (
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" required minLength={6}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            )}
            <button disabled={loading} type="submit" className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach transition-opacity disabled:opacity-60">
              {loading ? "Memproses…" : mode === "register" ? "Daftar" : mode === "forgot" ? "Kirim link reset" : "Masuk"}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />atau<span className="h-px flex-1 bg-border" />
              </div>
              <button onClick={google} disabled={loading}
                className="w-full rounded-full border border-border bg-background py-3 text-sm font-semibold text-foreground hover:bg-cream-deep">
                Lanjut dengan Google
              </button>
            </>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" && (
              <>
                Belum punya akun? <Link to="/auth" search={{ mode: "register" }} className="font-medium text-primary">Daftar</Link>
                <div className="mt-2"><Link to="/auth" search={{ mode: "forgot" }} className="text-xs">Lupa password?</Link></div>
              </>
            )}
            {mode === "register" && (
              <>Sudah punya akun? <Link to="/auth" search={{ mode: "login" }} className="font-medium text-primary">Masuk</Link></>
            )}
            {mode === "forgot" && (
              <Link to="/auth" search={{ mode: "login" }} className="text-primary">Kembali ke login</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
