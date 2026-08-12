import { useState } from "react";
import { X, Calendar, Trash2, TrendingUp, History, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

export interface HistoryItem {
  id: string;
  created_at: string;
  depression_score: number;
  anxiety_score: number;
  stress_score: number;
  depression_category: string;
  anxiety_category: string;
  stress_category: string;
}

interface CalmCheckHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onDeleteHistoryItem: (id: string) => Promise<void>;
}

export function CalmCheckHistoryModal({
  isOpen,
  onClose,
  history,
  onDeleteHistoryItem
}: CalmCheckHistoryModalProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah kamu yakin ingin menghapus data hasil asesmen ini?")) return;
    setDeletingId(id);
    try {
      await onDeleteHistoryItem(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in-up">
      <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-background p-6 shadow-float max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Riwayat Perkembangan Calm Check
              </h3>
              <p className="text-xs text-muted-foreground">
                Rekapitalisasi skrining emosional berkala milikmu.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* History Items List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-deep text-muted-foreground">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-foreground">Belum ada riwayat asesmen</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Selesaikan Calm Check pertama kamu untuk mulai memantau perkembangan emosional mingguan.
              </p>
            </div>
          ) : (
            history.map((item) => {
              let formattedDate = String(item.created_at || "Baru saja");
              try {
                const dateObj = new Date(item.created_at);
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = format(dateObj, "eeee, d MMMM yyyy (HH:mm)", {
                    locale: localeID
                  });
                }
              } catch (e) {
                console.warn("Error formatting date:", e);
              }

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/70 bg-surface/80 p-4 shadow-card space-y-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{formattedDate}</span>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{deletingId === item.id ? "Menghapus..." : "Hapus"}</span>
                    </button>
                  </div>

                  {/* 3 Domain Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="rounded-xl bg-cream-deep/60 p-2">
                      <p className="text-[10px] font-bold text-muted-foreground">Depresi</p>
                      <p className="text-sm font-extrabold text-foreground">{item.depression_score}</p>
                      <p className="text-[9px] font-semibold text-primary">{item.depression_category}</p>
                    </div>

                    <div className="rounded-xl bg-cream-deep/60 p-2">
                      <p className="text-[10px] font-bold text-muted-foreground">Kecemasan</p>
                      <p className="text-sm font-extrabold text-foreground">{item.anxiety_score}</p>
                      <p className="text-[9px] font-semibold text-primary">{item.anxiety_category}</p>
                    </div>

                    <div className="rounded-xl bg-cream-deep/60 p-2">
                      <p className="text-[10px] font-bold text-muted-foreground">Stres</p>
                      <p className="text-sm font-extrabold text-foreground">{item.stress_score}</p>
                      <p className="text-[9px] font-semibold text-primary">{item.stress_category}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-border/60 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-border bg-surface px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
