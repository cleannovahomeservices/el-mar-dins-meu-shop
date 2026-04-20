/* =============================================================
   AdminReviews — Panell de moderació de ressenyes
   Accessible a /admin/ressenyes (només per a admins)
   ============================================================= */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Trash2, LogOut, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type ReviewStatus = "pending" | "approved" | "rejected";

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pendent",
  approved: "Aprovada",
  rejected: "Rebutjada",
};

const STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: "oklch(0.75 0.12 75)",
  approved: "oklch(0.55 0.12 145)",
  rejected: "oklch(0.55 0.15 30)",
};

const STATUS_BG: Record<ReviewStatus, string> = {
  pending: "oklch(0.96 0.04 75)",
  approved: "oklch(0.96 0.04 145)",
  rejected: "oklch(0.96 0.04 30)",
};

export default function AdminReviews() {
  const { user, isAuthenticated, loading } = useAuth();
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");

  const { data: reviews = [], isLoading, refetch } = trpc.reviews.listAll.useQuery();

  const moderateMutation = trpc.reviews.moderate.useMutation({
    onSuccess: (_, vars) => {
      const label = STATUS_LABELS[vars.status as ReviewStatus];
      toast.success(`Ressenya ${label.toLowerCase()} correctament`);
      refetch();
    },
    onError: () => toast.error("Error en moderar la ressenya"),
  });

  const deleteMutation = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Ressenya eliminada");
      refetch();
    },
    onError: () => toast.error("Error en eliminar la ressenya"),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.01 55)" }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "oklch(0.55 0.1 200)" }} />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "oklch(0.97 0.01 55)" }}>
        <div className="text-center">
          <h1 className="font-black text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
            Accés restringit
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
            Necessites ser administrador per accedir a aquesta pàgina.
          </p>
        </div>
        <Link href="/">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "oklch(0.55 0.1 200)", color: "white", fontFamily: "'Nunito', sans-serif" }}>
            <ArrowLeft size={16} /> Tornar a la botiga
          </button>
        </Link>
      </div>
    );
  }

  const filtered = filter === "all" ? reviews : reviews.filter(r => r.status === filter);

  const counts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    rejected: reviews.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 55)" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md"
        style={{ background: "oklch(0.55 0.1 200 / 0.95)", boxShadow: "0 2px 20px rgba(0,0,0,0.15)" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}>
                <ArrowLeft size={16} /> Botiga
              </button>
            </Link>
            <span className="text-white/40">|</span>
            <h1 className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Moderació de ressenyes
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm hidden sm:block" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {user?.name || "Admin"}
            </span>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Resum */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {(["all", "pending", "approved", "rejected"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="rounded-2xl p-4 text-center transition-all hover:scale-105"
              style={{
                background: filter === s ? "oklch(0.55 0.1 200)" : "white",
                color: filter === s ? "white" : "oklch(0.3 0.06 50)",
                border: `2px solid ${filter === s ? "oklch(0.55 0.1 200)" : "oklch(0.9 0.02 55)"}`,
                fontFamily: "'Nunito', sans-serif",
              }}>
              <p className="font-black text-2xl">{counts[s]}</p>
              <p className="text-xs font-semibold mt-1">
                {s === "all" ? "Totes" : STATUS_LABELS[s]}
              </p>
            </button>
          ))}
        </div>

        {/* Llista de ressenyes */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: "oklch(0.55 0.1 200)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold" style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
              No hi ha ressenyes {filter !== "all" ? STATUS_LABELS[filter].toLowerCase() + "s" : ""}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm"
                style={{ border: "2px solid oklch(0.9 0.02 55)" }}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                    style={{ background: "oklch(0.72 0.08 200)" }}>
                    {review.authorName[0]?.toUpperCase()}
                  </div>

                  {/* Contingut */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-black text-base" style={{ color: "oklch(0.3 0.06 50)", fontFamily: "'Playfair Display', serif" }}>
                        {review.authorName}
                      </span>
                      {review.location && (
                        <span className="text-xs" style={{ color: "oklch(0.6 0.04 55)", fontFamily: "'Nunito', sans-serif" }}>
                          · {review.location}
                        </span>
                      )}
                      {/* Estat */}
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: STATUS_BG[review.status as ReviewStatus], color: STATUS_COLORS[review.status as ReviewStatus], fontFamily: "'Nunito', sans-serif" }}>
                        {STATUS_LABELS[review.status as ReviewStatus]}
                      </span>
                    </div>
                    {/* Estrelles */}
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                    {/* Text */}
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "oklch(0.4 0.04 55)", fontFamily: "'Nunito', sans-serif" }}>
                      "{review.content}"
                    </p>
                    {/* Data */}
                    <p className="text-xs" style={{ color: "oklch(0.65 0.03 55)", fontFamily: "'Nunito', sans-serif" }}>
                      {new Date(review.createdAt).toLocaleDateString("ca-ES", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>

                  {/* Accions */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    {review.status !== "approved" && (
                      <button
                        onClick={() => moderateMutation.mutate({ id: review.id, status: "approved" })}
                        disabled={moderateMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{ background: "oklch(0.55 0.12 145)", color: "white", fontFamily: "'Nunito', sans-serif" }}>
                        <CheckCircle size={14} /> Aprovar
                      </button>
                    )}
                    {review.status !== "rejected" && (
                      <button
                        onClick={() => moderateMutation.mutate({ id: review.id, status: "rejected" })}
                        disabled={moderateMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{ background: "oklch(0.55 0.15 30)", color: "white", fontFamily: "'Nunito', sans-serif" }}>
                        <XCircle size={14} /> Rebutjar
                      </button>
                    )}
                    {review.status === "pending" && (
                      <button
                        onClick={() => {}}
                        disabled
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold opacity-50 cursor-default"
                        style={{ background: "oklch(0.88 0.06 75)", color: "oklch(0.4 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                        <Clock size={14} /> Pendent
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Segur que vols eliminar aquesta ressenya?")) {
                          deleteMutation.mutate({ id: review.id });
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                      style={{ background: "oklch(0.95 0.01 55)", color: "oklch(0.5 0.05 55)", border: "1px solid oklch(0.85 0.02 55)", fontFamily: "'Nunito', sans-serif" }}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
