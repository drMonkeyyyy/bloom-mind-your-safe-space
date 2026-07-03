import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({ mode: z.enum(["login", "register", "forgot"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Masuk · JN-CALM" }] }),
  component: AuthPage,
});

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "bg-border" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Sangat lemah", color: "bg-red-400" },
    { label: "Lemah", color: "bg-orange-400" },
    { label: "Cukup", color: "bg-yellow-400" },
    { label: "Kuat", color: "bg-primary" },
    { label: "Sangat kuat", color: "bg-emerald-500" },
  ];
  return { score, ...levels[score] };
}

const TESTIMONIAL = {
  quote: "JN-CALM benar-benar tempat aku bisa jadi diri sendiri. Nggak dihakimi, nggak harus kuat.",
  name: "Naya, 23",
  role: "Mahasiswi",
};

function AuthPage() {
  const { mode = "login" } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/app", replace: true });
    }
  }, [user, authLoading, navigate]);

  const pwStrength = mode === "register" ? passwordStrength(password) : null;

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
        toast.success("Akun dibuat. Selamat datang di JN-CALM 🌿");
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
      options: { redirectTo: window.location.origin + "/app" },
    });
    if (error) {
      toast.error("Login Google gagal: " + error.message);
      setLoading(false);
    }
  };

  const formTitle = mode === "register" ? "Buat akun gratis" : mode === "forgot" ? "Reset password" : "Selamat datang kembali";
  const formSub = mode === "register" ? "Tempat aman untuk tumbuh dan memahami diri."
    : mode === "forgot" ? "Kami akan kirim link reset ke email kamu."
    : "Masuk untuk melanjutkan perjalananmu.";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2" style={{ background: "var(--gradient-hero)" }}>
      {/* ── LEFT BRAND PANEL (desktop only) ──────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex" style={{ background: "var(--gradient-sage)" }}>
        {/* Decorative blobs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute right-20 top-1/2 h-40 w-40 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <img src="/logo.png" alt="JN-CALM Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-white">JN-CALM</p>
              <p className="text-xs text-white/70">Your Safe Space To Grow</p>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative">
          <p className="font-display text-4xl font-semibold leading-tight text-white">
            Tempat aman untuk<br />
            <span className="italic opacity-90">curhat, bertumbuh,</span><br />
            dan memahami diri.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {["🔒 Aman & Privat", "🌐 Bahasa Indonesia", "⚡ 24 Jam Aktif", "🆓 Gratis Dicoba"].map((b) => (
              <span key={b} className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
          <p className="font-display text-lg italic leading-relaxed text-white">"{TESTIMONIAL.quote}"</p>
          <p className="mt-4 text-sm font-semibold text-white/90">— {TESTIMONIAL.name}, {TESTIMONIAL.role}</p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ──────────────────────────────────────── */}
      <div className="flex flex-col">
        {/* Mobile header */}
        <div className="px-6 py-5 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 overflow-hidden rounded-xl bg-white shadow-soft flex items-center justify-center border border-border/50">
              <img src="/logo.png" alt="JN-CALM Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display text-xl font-bold tracking-widest text-[#6E8C71]">JN-CALM</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="rounded-3xl bg-card p-8 shadow-elevated ring-1 ring-border animate-scale-in">
              <h1 className="font-display text-2xl font-semibold text-foreground">{formTitle}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{formSub}</p>

              <form onSubmit={submit} className="mt-6 space-y-3">
                {mode === "register" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="auth-name">Nama panggilan</label>
                    <input
                      id="auth-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Panggil aku…"
                      required
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="auth-email">Email</label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm"
                  />
                </div>
                {mode !== "forgot" && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium" htmlFor="auth-password">Password</label>
                    <div className="relative">
                      <input
                        id="auth-password"
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        minLength={6}
                        className="w-full rounded-2xl border border-border bg-background py-3 pl-4 pr-12 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                        aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showPw ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {/* Password strength */}
                    {mode === "register" && password && (
                      <div className="mt-2 space-y-1.5">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < pwStrength!.score ? pwStrength!.color : "bg-border"}`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{pwStrength!.label}</p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading ? "Memproses…" : mode === "register" ? "Daftar Gratis" : mode === "forgot" ? "Kirim Link Reset" : "Masuk"}
                </button>
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="my-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">atau</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <button
                    onClick={google}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background py-3 text-sm font-semibold text-foreground transition-all hover:bg-cream-deep disabled:opacity-60"
                  >
                    {/* Google G logo */}
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Lanjut dengan Google
                  </button>
                </>
              )}

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "login" && (
                  <>
                    Belum punya akun?{" "}
                    <Link to="/auth" search={{ mode: "register" }} className="font-semibold text-primary hover:underline">Daftar gratis</Link>
                    <div className="mt-2">
                      <Link to="/auth" search={{ mode: "forgot" }} className="text-xs hover:underline">Lupa password?</Link>
                    </div>
                  </>
                )}
                {mode === "register" && (
                  <>Sudah punya akun?{" "}
                    <Link to="/auth" search={{ mode: "login" }} className="font-semibold text-primary hover:underline">Masuk</Link>
                  </>
                )}
                {mode === "forgot" && (
                  <Link to="/auth" search={{ mode: "login" }} className="text-primary hover:underline">← Kembali ke login</Link>
                )}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Dengan mendaftar, kamu menyetujui{" "}
              <a href="#" className="underline">Syarat Layanan</a> dan{" "}
              <a href="#" className="underline">Kebijakan Privasi</a> JN-CALM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
