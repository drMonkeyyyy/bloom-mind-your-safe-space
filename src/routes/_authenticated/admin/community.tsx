import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ShieldCheck, Trash2, AlertTriangle, UserX, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/community")({
  component: AdminCommunityModeration,
});

interface ReportedPost {
  id: string;
  post_id: string;
  post_content: string;
  author_name: string;
  reported_by: string;
  reason: string;
  created_at: string;
}

function AdminCommunityModeration() {
  const [reports, setReports] = useState<ReportedPost[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  const loadReports = () => {
    try {
      const savedReports = localStorage.getItem("jn_reported_posts");
      const savedBlocked = localStorage.getItem("jn_blocked_users");
      if (savedReports) setReports(JSON.parse(savedReports));
      if (savedBlocked) setBlockedUsers(JSON.parse(savedBlocked));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDismissReport = (reportId: string) => {
    const updated = reports.filter((r) => r.id !== reportId);
    setReports(updated);
    try {
      localStorage.setItem("jn_reported_posts", JSON.stringify(updated));
    } catch { /* silent */ }
    toast.success("Laporan diabaikan.");
  };

  const handleDeleteReportedPost = (reportId: string, postId: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus postingan ini dari komunitas?")) return;

    try {
      // Remove post from bloom_community_v3
      const rawPosts = localStorage.getItem("bloom_community_v3");
      if (rawPosts) {
        const posts = JSON.parse(rawPosts);
        const updatedPosts = posts.filter((p: any) => p.id !== postId);
        localStorage.setItem("bloom_community_v3", JSON.stringify(updatedPosts));
      }

      // Remove report
      const updatedReports = reports.filter((r) => r.id !== reportId);
      setReports(updatedReports);
      localStorage.setItem("jn_reported_posts", JSON.stringify(updatedReports));

      toast.success("Postingan berhasil dihapus dari komunitas.");
    } catch (e) {
      console.error(e);
      toast.error("Gagal menghapus postingan.");
    }
  };

  const handleClearBlocked = () => {
    if (!confirm("Bersihkan seluruh daftar pengguna yang diblokir lokal?")) return;
    setBlockedUsers([]);
    try {
      localStorage.removeItem("jn_blocked_users");
    } catch { /* silent */ }
    toast.success("Daftar blokir dibersihkan.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Moderasi Komunitas JN-CALM</h1>
          <p className="text-xs text-muted-foreground">Kelola laporan postingan & keamanan ruang aman anggota</p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4" />
          <span>Sistem Moderasi Aktif</span>
        </div>
      </div>

      {/* Reported Posts Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Laporan Postingan Pengguna ({reports.length})</span>
          </h2>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <span>Tidak ada laporan postingan. Komunitas dalam kondisi aman dan kondusif!</span>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs dark:bg-amber-950/20 dark:border-amber-900/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      Alasan: {rep.reason}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Dilaporkan oleh ID: {rep.reported_by.slice(0, 8)}... pada {new Date(rep.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-card p-3 border border-border/60">
                  <p className="text-xs font-semibold text-foreground">Penulis: {rep.author_name}</p>
                  <p className="mt-1 text-xs text-foreground/80 italic leading-relaxed">
                    "{rep.post_content}"
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleDismissReport(rep.id)}
                    className="rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Abaikan Laporan
                  </button>
                  <button
                    onClick={() => handleDeleteReportedPost(rep.id, rep.post_id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Postingan Ini</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Blocked Users Section */}
      <section className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <UserX className="h-4 w-4 text-rose-500" />
            <span>Pengguna Diblokir ({blockedUsers.length})</span>
          </h2>
          {blockedUsers.length > 0 && (
            <button
              onClick={handleClearBlocked}
              className="text-xs font-semibold text-rose-600 hover:underline"
            >
              Bersihkan Daftar
            </button>
          )}
        </div>

        {blockedUsers.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada ID pengguna yang diblokir secara lokal.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {blockedUsers.map((uid) => (
              <span key={uid} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                <span>🚫 {uid.slice(0, 10)}...</span>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
