/* =============================================================
   AdminTrash — Paperera per a admins
   /admin/papelera           → tots els tipus (pestanyes)
   /admin/papelera-comandes  → només comandes
   ============================================================= */

import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  RotateCcw,
  Package,
  MessageSquare,
  GraduationCap,
  MapPin,
  AlertTriangle,
  Layers,
} from "lucide-react";

type TabKey = "all" | "orders" | "reviews" | "workshopReviews" | "pickupPoints";

const TAB_LABELS: Record<TabKey, string> = {
  all: "Totes",
  orders: "Comandes",
  reviews: "Ressenyes del llibre",
  workshopReviews: "Ressenyes de tallers",
  pickupPoints: "Punts de recollida",
};

const TAB_ICONS: Record<TabKey, typeof Package> = {
  all: Layers,
  orders: Package,
  reviews: MessageSquare,
  workshopReviews: GraduationCap,
  pickupPoints: MapPin,
};

interface TrashedOrder {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
  itemsJson: string;
  paymentMethod: string;
  isPaid: number;
  isDelivered: number;
  deletedAt: string | Date;
  createdAt: string | Date;
}

interface TrashedReview {
  id: number;
  authorName: string;
  location: string | null;
  rating: number;
  content: string;
  status: string;
  deletedAt: string | Date;
  createdAt: string | Date;
}

interface TrashedWorkshopReview {
  id: number;
  authorName: string;
  email: string | null;
  eventType: string;
  eventTitle: string | null;
  rating: number;
  content: string;
  status: string;
  deletedAt: string | Date;
  createdAt: string | Date;
}

interface TrashedPickupPoint {
  id: number;
  name: string;
  type: string;
  city: string;
  email: string;
  contactPerson: string;
  status: string;
  deletedAt: string | Date;
  createdAt: string | Date;
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ca-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="bg-white rounded-2xl p-12 text-center shadow-sm"
      style={{ border: "2px dashed oklch(0.88 0.04 75)" }}
    >
      <Trash2 size={48} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.5 0.05 55)" }} />
      <p className="text-lg font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.05 55)" }}>
        La paperera de {label.toLowerCase()} està buida
      </p>
    </div>
  );
}

function RowCard({
  title,
  subtitle,
  meta,
  deletedAt,
  onRestore,
  onHardDelete,
  isRestoring,
  isHardDeleting,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  deletedAt: string | Date;
  onRestore: () => void;
  onHardDelete: () => void;
  isRestoring: boolean;
  isHardDeleting: boolean;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3"
      style={{ border: "2px solid oklch(0.88 0.04 75)" }}
    >
      <div className="flex-1 min-w-[200px]">
        <p className="font-black text-sm" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.3 0.05 55)" }}>
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {subtitle}
          </p>
        )}
        {meta && (
          <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {meta}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1 italic" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Esborrat el {formatDate(deletedAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onRestore}
          disabled={isRestoring || isHardDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "oklch(0.6 0.15 145 / 0.12)",
            color: "oklch(0.35 0.12 145)",
            border: "2px solid oklch(0.6 0.15 145 / 0.4)",
            fontFamily: "'Nunito', sans-serif",
          }}
          title="Recuperar"
        >
          <RotateCcw size={12} /> Recuperar
        </button>

        <button
          onClick={onHardDelete}
          disabled={isRestoring || isHardDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "oklch(0.95 0.05 30)",
            color: "oklch(0.55 0.15 30)",
            border: "2px solid oklch(0.85 0.08 30 / 0.5)",
            fontFamily: "'Nunito', sans-serif",
          }}
          title="Esborrar definitivament"
        >
          <Trash2 size={12} /> Esborrar per sempre
        </button>
      </div>
    </div>
  );
}

function OrdersTrashList() {
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.orders.listTrashed.useQuery();

  const restore = trpc.orders.restore.useMutation({
    onSuccess: () => {
      toast.success("Comanda recuperada");
      utils.orders.listTrashed.invalidate();
      utils.orders.listAll.invalidate();
    },
    onError: () => toast.error("Error en recuperar la comanda"),
  });

  const hardDelete = trpc.orders.hardDelete.useMutation({
    onSuccess: () => {
      toast.success("Comanda esborrada per sempre");
      utils.orders.listTrashed.invalidate();
    },
    onError: () => toast.error("Error en esborrar definitivament"),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!items.length) return <EmptyState label="comandes" />;

  return (
    <div className="flex flex-col gap-3">
      {(items as TrashedOrder[]).map((o) => {
        const itemsArr = (() => {
          try {
            return JSON.parse(o.itemsJson || "[]") as Array<{ name: string; size: string; quantity: number }>;
          } catch {
            return [];
          }
        })();
        const productsStr = itemsArr.map((i) => `${i.name} T.${i.size} x${i.quantity}`).join(", ");
        return (
          <RowCard
            key={o.id}
            title={`#${o.id} · ${o.customerName} — ${o.totalPrice}€`}
            subtitle={`${o.customerEmail} · ${o.customerPhone}`}
            meta={productsStr || undefined}
            deletedAt={o.deletedAt}
            onRestore={() => restore.mutate({ id: o.id })}
            onHardDelete={() => {
              if (confirm(`Esborrar per sempre la comanda de ${o.customerName}? Aquesta acció no es pot desfer.`)) {
                hardDelete.mutate({ id: o.id });
              }
            }}
            isRestoring={restore.isPending}
            isHardDeleting={hardDelete.isPending}
          />
        );
      })}
    </div>
  );
}

function ReviewsTrashList() {
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.reviews.listTrashed.useQuery();

  const restore = trpc.reviews.restore.useMutation({
    onSuccess: () => {
      toast.success("Ressenya recuperada");
      utils.reviews.listTrashed.invalidate();
      utils.reviews.listAll.invalidate();
      utils.reviews.listApproved.invalidate();
    },
    onError: () => toast.error("Error en recuperar la ressenya"),
  });

  const hardDelete = trpc.reviews.hardDelete.useMutation({
    onSuccess: () => {
      toast.success("Ressenya esborrada per sempre");
      utils.reviews.listTrashed.invalidate();
    },
    onError: () => toast.error("Error en esborrar definitivament"),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!items.length) return <EmptyState label="ressenyes" />;

  return (
    <div className="flex flex-col gap-3">
      {(items as TrashedReview[]).map((r) => (
        <RowCard
          key={r.id}
          title={`${r.authorName} · ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}`}
          subtitle={r.location || undefined}
          meta={r.content.length > 140 ? r.content.slice(0, 140) + "…" : r.content}
          deletedAt={r.deletedAt}
          onRestore={() => restore.mutate({ id: r.id })}
          onHardDelete={() => {
            if (confirm(`Esborrar per sempre la ressenya de ${r.authorName}? Aquesta acció no es pot desfer.`)) {
              hardDelete.mutate({ id: r.id });
            }
          }}
          isRestoring={restore.isPending}
          isHardDeleting={hardDelete.isPending}
        />
      ))}
    </div>
  );
}

function WorkshopReviewsTrashList() {
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.workshopReviews.listTrashed.useQuery();

  const restore = trpc.workshopReviews.restore.useMutation({
    onSuccess: () => {
      toast.success("Ressenya de taller recuperada");
      utils.workshopReviews.listTrashed.invalidate();
      utils.workshopReviews.listAll.invalidate();
      utils.workshopReviews.listApproved.invalidate();
    },
    onError: () => toast.error("Error en recuperar la ressenya"),
  });

  const hardDelete = trpc.workshopReviews.hardDelete.useMutation({
    onSuccess: () => {
      toast.success("Ressenya esborrada per sempre");
      utils.workshopReviews.listTrashed.invalidate();
    },
    onError: () => toast.error("Error en esborrar definitivament"),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!items.length) return <EmptyState label="ressenyes de tallers" />;

  return (
    <div className="flex flex-col gap-3">
      {(items as TrashedWorkshopReview[]).map((r) => (
        <RowCard
          key={r.id}
          title={`${r.authorName} · ${r.eventType}${r.eventTitle ? ` — ${r.eventTitle}` : ""}`}
          subtitle={r.email || undefined}
          meta={r.content.length > 140 ? r.content.slice(0, 140) + "…" : r.content}
          deletedAt={r.deletedAt}
          onRestore={() => restore.mutate({ id: r.id })}
          onHardDelete={() => {
            if (confirm(`Esborrar per sempre la ressenya de ${r.authorName}? Aquesta acció no es pot desfer.`)) {
              hardDelete.mutate({ id: r.id });
            }
          }}
          isRestoring={restore.isPending}
          isHardDeleting={hardDelete.isPending}
        />
      ))}
    </div>
  );
}

function PickupPointsTrashList() {
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.pickupPoints.listTrashed.useQuery();

  const restore = trpc.pickupPoints.restore.useMutation({
    onSuccess: () => {
      toast.success("Punt de recollida recuperat");
      utils.pickupPoints.listTrashed.invalidate();
      utils.pickupPoints.listAll.invalidate();
      utils.pickupPoints.listApproved.invalidate();
    },
    onError: () => toast.error("Error en recuperar el punt"),
  });

  const hardDelete = trpc.pickupPoints.hardDelete.useMutation({
    onSuccess: () => {
      toast.success("Punt esborrat per sempre");
      utils.pickupPoints.listTrashed.invalidate();
    },
    onError: () => toast.error("Error en esborrar definitivament"),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!items.length) return <EmptyState label="punts de recollida" />;

  return (
    <div className="flex flex-col gap-3">
      {(items as TrashedPickupPoint[]).map((p) => (
        <RowCard
          key={p.id}
          title={`${p.name} (${p.type})`}
          subtitle={`${p.city} · ${p.contactPerson}`}
          meta={p.email}
          deletedAt={p.deletedAt}
          onRestore={() => restore.mutate({ id: p.id })}
          onHardDelete={() => {
            if (confirm(`Esborrar per sempre el punt "${p.name}"? Aquesta acció no es pot desfer.`)) {
              hardDelete.mutate({ id: p.id });
            }
          }}
          isRestoring={restore.isPending}
          isHardDeleting={hardDelete.isPending}
        />
      ))}
    </div>
  );
}

function AllTrashList() {
  const utils = trpc.useUtils();
  const orders = trpc.orders.listTrashed.useQuery();
  const reviews = trpc.reviews.listTrashed.useQuery();
  const workshopReviews = trpc.workshopReviews.listTrashed.useQuery();
  const pickupPoints = trpc.pickupPoints.listTrashed.useQuery();

  const restoreOrder = trpc.orders.restore.useMutation({
    onSuccess: () => {
      toast.success("Comanda recuperada");
      utils.orders.listTrashed.invalidate();
      utils.orders.listAll.invalidate();
    },
    onError: () => toast.error("Error en recuperar la comanda"),
  });
  const hardDeleteOrder = trpc.orders.hardDelete.useMutation({
    onSuccess: () => {
      toast.success("Comanda esborrada per sempre");
      utils.orders.listTrashed.invalidate();
    },
    onError: () => toast.error("Error en esborrar definitivament"),
  });

  const restoreReview = trpc.reviews.restore.useMutation({
    onSuccess: () => {
      toast.success("Ressenya recuperada");
      utils.reviews.listTrashed.invalidate();
      utils.reviews.listAll.invalidate();
      utils.reviews.listApproved.invalidate();
    },
    onError: () => toast.error("Error en recuperar la ressenya"),
  });
  const hardDeleteReview = trpc.reviews.hardDelete.useMutation({
    onSuccess: () => {
      toast.success("Ressenya esborrada per sempre");
      utils.reviews.listTrashed.invalidate();
    },
    onError: () => toast.error("Error en esborrar definitivament"),
  });

  const restoreWorkshop = trpc.workshopReviews.restore.useMutation({
    onSuccess: () => {
      toast.success("Ressenya de taller recuperada");
      utils.workshopReviews.listTrashed.invalidate();
      utils.workshopReviews.listAll.invalidate();
      utils.workshopReviews.listApproved.invalidate();
    },
    onError: () => toast.error("Error en recuperar la ressenya"),
  });
  const hardDeleteWorkshop = trpc.workshopReviews.hardDelete.useMutation({
    onSuccess: () => {
      toast.success("Ressenya esborrada per sempre");
      utils.workshopReviews.listTrashed.invalidate();
    },
    onError: () => toast.error("Error en esborrar definitivament"),
  });

  const restorePickup = trpc.pickupPoints.restore.useMutation({
    onSuccess: () => {
      toast.success("Punt de recollida recuperat");
      utils.pickupPoints.listTrashed.invalidate();
      utils.pickupPoints.listAll.invalidate();
      utils.pickupPoints.listApproved.invalidate();
    },
    onError: () => toast.error("Error en recuperar el punt"),
  });
  const hardDeletePickup = trpc.pickupPoints.hardDelete.useMutation({
    onSuccess: () => {
      toast.success("Punt esborrat per sempre");
      utils.pickupPoints.listTrashed.invalidate();
    },
    onError: () => toast.error("Error en esborrar definitivament"),
  });

  const isLoading =
    orders.isLoading || reviews.isLoading || workshopReviews.isLoading || pickupPoints.isLoading;

  if (isLoading) return <LoadingSpinner />;

  type Combined = {
    kind: TabKey;
    kindLabel: string;
    KindIcon: typeof Package;
    id: number;
    title: string;
    subtitle?: string;
    meta?: string;
    deletedAt: string | Date;
    confirmText: string;
    onRestore: () => void;
    onHardDelete: () => void;
    isPending: boolean;
  };

  const combined: Combined[] = [];

  (orders.data as TrashedOrder[] | undefined)?.forEach((o) => {
    const itemsArr = (() => {
      try {
        return JSON.parse(o.itemsJson || "[]") as Array<{ name: string; size: string; quantity: number }>;
      } catch {
        return [];
      }
    })();
    const productsStr = itemsArr.map((i) => `${i.name} T.${i.size} x${i.quantity}`).join(", ");
    combined.push({
      kind: "orders",
      kindLabel: "Comanda",
      KindIcon: Package,
      id: o.id,
      title: `#${o.id} · ${o.customerName} — ${o.totalPrice}€`,
      subtitle: `${o.customerEmail} · ${o.customerPhone}`,
      meta: productsStr || undefined,
      deletedAt: o.deletedAt,
      confirmText: `Esborrar per sempre la comanda de ${o.customerName}? Aquesta acció no es pot desfer.`,
      onRestore: () => restoreOrder.mutate({ id: o.id }),
      onHardDelete: () => hardDeleteOrder.mutate({ id: o.id }),
      isPending: restoreOrder.isPending || hardDeleteOrder.isPending,
    });
  });

  (reviews.data as TrashedReview[] | undefined)?.forEach((r) => {
    combined.push({
      kind: "reviews",
      kindLabel: "Ressenya del llibre",
      KindIcon: MessageSquare,
      id: r.id,
      title: `${r.authorName} · ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}`,
      subtitle: r.location || undefined,
      meta: r.content.length > 140 ? r.content.slice(0, 140) + "…" : r.content,
      deletedAt: r.deletedAt,
      confirmText: `Esborrar per sempre la ressenya de ${r.authorName}? Aquesta acció no es pot desfer.`,
      onRestore: () => restoreReview.mutate({ id: r.id }),
      onHardDelete: () => hardDeleteReview.mutate({ id: r.id }),
      isPending: restoreReview.isPending || hardDeleteReview.isPending,
    });
  });

  (workshopReviews.data as TrashedWorkshopReview[] | undefined)?.forEach((r) => {
    combined.push({
      kind: "workshopReviews",
      kindLabel: "Ressenya de taller",
      KindIcon: GraduationCap,
      id: r.id,
      title: `${r.authorName} · ${r.eventType}${r.eventTitle ? ` — ${r.eventTitle}` : ""}`,
      subtitle: r.email || undefined,
      meta: r.content.length > 140 ? r.content.slice(0, 140) + "…" : r.content,
      deletedAt: r.deletedAt,
      confirmText: `Esborrar per sempre la ressenya de ${r.authorName}? Aquesta acció no es pot desfer.`,
      onRestore: () => restoreWorkshop.mutate({ id: r.id }),
      onHardDelete: () => hardDeleteWorkshop.mutate({ id: r.id }),
      isPending: restoreWorkshop.isPending || hardDeleteWorkshop.isPending,
    });
  });

  (pickupPoints.data as TrashedPickupPoint[] | undefined)?.forEach((p) => {
    combined.push({
      kind: "pickupPoints",
      kindLabel: "Punt de recollida",
      KindIcon: MapPin,
      id: p.id,
      title: `${p.name} (${p.type})`,
      subtitle: `${p.city} · ${p.contactPerson}`,
      meta: p.email,
      deletedAt: p.deletedAt,
      confirmText: `Esborrar per sempre el punt "${p.name}"? Aquesta acció no es pot desfer.`,
      onRestore: () => restorePickup.mutate({ id: p.id }),
      onHardDelete: () => hardDeletePickup.mutate({ id: p.id }),
      isPending: restorePickup.isPending || hardDeletePickup.isPending,
    });
  });

  combined.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

  if (!combined.length) {
    return (
      <div
        className="bg-white rounded-2xl p-12 text-center shadow-sm"
        style={{ border: "2px dashed oklch(0.88 0.04 75)" }}
      >
        <Trash2 size={48} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.5 0.05 55)" }} />
        <p className="text-lg font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.05 55)" }}>
          La paperera està buida
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {combined.map((c) => (
        <div
          key={`${c.kind}-${c.id}`}
          className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3"
          style={{ border: "2px solid oklch(0.88 0.04 75)" }}
        >
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: "oklch(0.72 0.08 200 / 0.12)",
                  color: "oklch(0.45 0.1 200)",
                  border: "1.5px solid oklch(0.72 0.08 200 / 0.3)",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                <c.KindIcon size={11} /> {c.kindLabel}
              </span>
            </div>
            <p className="font-black text-sm" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.3 0.05 55)" }}>
              {c.title}
            </p>
            {c.subtitle && (
              <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {c.subtitle}
              </p>
            )}
            {c.meta && (
              <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {c.meta}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1 italic" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Esborrat el {formatDate(c.deletedAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={c.onRestore}
              disabled={c.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "oklch(0.6 0.15 145 / 0.12)",
                color: "oklch(0.35 0.12 145)",
                border: "2px solid oklch(0.6 0.15 145 / 0.4)",
                fontFamily: "'Nunito', sans-serif",
              }}
              title="Recuperar"
            >
              <RotateCcw size={12} /> Recuperar
            </button>

            <button
              onClick={() => {
                if (confirm(c.confirmText)) c.onHardDelete();
              }}
              disabled={c.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "oklch(0.95 0.05 30)",
                color: "oklch(0.55 0.15 30)",
                border: "2px solid oklch(0.85 0.08 30 / 0.5)",
                fontFamily: "'Nunito', sans-serif",
              }}
              title="Esborrar definitivament"
            >
              <Trash2 size={12} /> Esborrar per sempre
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[oklch(0.72_0.08_200)] border-t-transparent" />
    </div>
  );
}

export default function AdminTrash({ onlyOrders = false }: { onlyOrders?: boolean }) {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<TabKey>(onlyOrders ? "orders" : "all");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.97 0.02 75)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[oklch(0.72_0.08_200)] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "oklch(0.97 0.02 75)" }}>
        <p className="text-xl font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.4 0.05 55)" }}>
          Accés restringit a administradors
        </p>
        <Link href="/">
          <button className="px-6 py-2 rounded-xl font-bold text-white"
            style={{ background: "oklch(0.72 0.08 200)", fontFamily: "'Nunito', sans-serif" }}>
            Tornar a la botiga
          </button>
        </Link>
      </div>
    );
  }

  const tabs: TabKey[] = onlyOrders
    ? ["orders"]
    : ["all", "orders", "reviews", "workshopReviews", "pickupPoints"];

  const renderTab = () => {
    switch (tab) {
      case "all":
        return <AllTrashList />;
      case "orders":
        return <OrdersTrashList />;
      case "reviews":
        return <ReviewsTrashList />;
      case "workshopReviews":
        return <WorkshopReviewsTrashList />;
      case "pickupPoints":
        return <PickupPointsTrashList />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.02 75)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ background: "oklch(0.45 0.1 200)", color: "white" }}>
        <div className="container py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/20"
                style={{ fontFamily: "'Nunito', sans-serif" }}>
                <ArrowLeft size={16} /> Botiga
              </button>
            </Link>
            <h1 className="font-black text-xl flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              <Trash2 size={20} />
              {onlyOrders ? "Paperera de comandes" : "Paperera"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {onlyOrders ? (
              <Link href="/admin/papelera">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/20"
                  style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Veure tota la paperera
                </button>
              </Link>
            ) : (
              <Link href="/admin/papelera-comandes">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/20"
                  style={{ fontFamily: "'Nunito', sans-serif" }}>
                  Només comandes
                </button>
              </Link>
            )}
            <Link href="/admin/comandes">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/20"
                style={{ fontFamily: "'Nunito', sans-serif" }}>
                Tornar a comandes
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Avís informatiu */}
        <div className="mb-4 p-3 rounded-2xl flex items-start gap-3"
          style={{ background: "oklch(0.95 0.05 60)", border: "2px solid oklch(0.82 0.08 60 / 0.5)" }}>
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "oklch(0.55 0.12 60)" }} />
          <div className="text-sm" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.4 0.08 55)" }}>
            Els elements esborrats es queden aquí fins que els recuperis o els esborris per sempre.
            <strong> Esborrar per sempre no es pot desfer.</strong>
          </div>
        </div>

        {/* Pestanyes */}
        {!onlyOrders && (
          <div className="bg-white rounded-2xl p-2 mb-4 shadow-sm flex flex-wrap gap-1"
            style={{ border: "2px solid oklch(0.88 0.04 75)" }}>
            {tabs.map((t) => {
              const Icon = TAB_ICONS[t];
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: active ? "oklch(0.72 0.08 200 / 0.15)" : "transparent",
                    color: active ? "oklch(0.45 0.1 200)" : "oklch(0.5 0.05 55)",
                    border: `2px solid ${active ? "oklch(0.72 0.08 200 / 0.4)" : "transparent"}`,
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  <Icon size={14} />
                  {TAB_LABELS[t]}
                </button>
              );
            })}
          </div>
        )}

        {renderTab()}
      </div>
    </div>
  );
}
