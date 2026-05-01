/* =============================================================
   AdminOrders — El Mar dins Meu
   Panell d'administració de comandes
   ============================================================= */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  CheckCircle,
  Circle,
  Package,
  PackageCheck,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Search,
  StickyNote,
  Download,
  FileDown,
  Bell,
  Loader2,
  Printer,
  ChevronRight,
} from "lucide-react";

// ── Component: Resum de producció per a la impremta ─────────────────
function ProductionSummaryBlock({ orders }: { orders: Order[] }) {
  const [open, setOpen] = useState(false);

  const PRODUCT_ORDER = ["Samarreta Noi", "Samarreta Noia", "Samarreta Tirants", "Samarreta Infantil"];
  const SIZE_ORDER: Record<string, string[]> = {
    "Samarreta Noi":      ["S", "M", "L", "XL", "XXL", "3XL"],
    "Samarreta Noia":     ["S", "M", "L", "XL", "2XL"],
    "Samarreta Tirants":  ["S", "M", "L", "XL", "2XL"],
    "Samarreta Infantil": ["3/4", "5/6", "7/8", "9/10", "11/12"],
  };

  // Acumular totals
  const totals: Record<string, Record<string, number>> = {};
  orders.forEach(o => {
    const items: OrderItem[] = JSON.parse(o.itemsJson || "[]");
    items.forEach(item => {
      if (!totals[item.name]) totals[item.name] = {};
      totals[item.name][item.size] = (totals[item.name][item.size] || 0) + item.quantity;
    });
  });

  const grandTotal = Object.values(totals).reduce(
    (sum, sizes) => sum + Object.values(sizes).reduce((s, n) => s + n, 0), 0
  );

  const handleExportCSV = () => {
    const rows: string[][] = [];
    // Capçalera amb data de comanda
    rows.push(["Data comanda", "Producte", "Talla", "Quantitat"]);

    // Detall per comanda i article (ordenat per data)
    const sortedOrders = [...orders].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    sortedOrders.forEach(o => {
      const orderDate = new Date(o.createdAt).toLocaleDateString("ca-ES", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });
      const items: OrderItem[] = JSON.parse(o.itemsJson || "[]");
      items.forEach(item => {
        rows.push([orderDate, item.name, item.size, String(item.quantity)]);
      });
    });

    // Fila de total
    rows.push(["", "TOTAL", "", String(grandTotal)]);

    const csvContent = rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
    a.href = url;
    a.download = `resum-produccio-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const lines: string[] = [
      "RESUM DE PRODUCCIÓ — El Mar dins Meu",
      `Data: ${new Date().toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}`,
      `Total comandes: ${orders.length}`,
      "",
    ];
    PRODUCT_ORDER.forEach(prod => {
      const sizes = totals[prod];
      if (!sizes) return;
      const prodTotal = Object.values(sizes).reduce((s, n) => s + n, 0);
      lines.push(`${prod.toUpperCase()} (${prodTotal} u.)`);
      (SIZE_ORDER[prod] || Object.keys(sizes)).forEach(size => {
        const qty = sizes[size] || 0;
        if (qty > 0) lines.push(`  Talla ${size}: ${qty}`);
      });
      lines.push("");
    });
    lines.push(`TOTAL SAMARRETES: ${grandTotal}`);

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Resum producció</title>
      <style>body{font-family:monospace;padding:2rem;font-size:14px;line-height:1.8}
      h2{margin-bottom:0.5rem}pre{white-space:pre-wrap}</style></head>
      <body><pre>${lines.join("\n")}</pre></body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
      style={{ border: "2px solid oklch(0.72 0.08 200 / 0.4)" }}>
      {/* Capçalera clicable */}
      <div
        onClick={() => setOpen(prev => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 transition-all hover:bg-[oklch(0.72_0.08_200_/_0.05)] cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.72 0.08 200 / 0.15)" }}>
            <Printer size={18} style={{ color: "oklch(0.45 0.1 200)" }} />
          </div>
          <div className="text-left">
            <p className="font-black text-sm" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.3 0.05 55)" }}>
              Resum per a la impremta
            </p>
            <p className="text-xs text-gray-400" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {grandTotal} samarretes en total · {orders.length} comandes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{
              background: "oklch(0.55 0.15 145 / 0.12)",
              color: "oklch(0.35 0.12 145)",
              border: "2px solid oklch(0.55 0.15 145 / 0.3)",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <Download size={12} /> CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{
              background: "oklch(0.72 0.08 200 / 0.12)",
              color: "oklch(0.45 0.1 200)",
              border: "2px solid oklch(0.72 0.08 200 / 0.3)",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <Printer size={12} /> Imprimir
          </button>
          <ChevronRight
            size={18}
            style={{ color: "oklch(0.6 0.04 55)", transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
        </div>
      </div>

      {/* Taula desplegable */}
      {open && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: "oklch(0.92 0.02 75)" }}>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRODUCT_ORDER.map(prod => {
              const sizes = totals[prod];
              if (!sizes) return null;
              const prodTotal = Object.values(sizes).reduce((s, n) => s + n, 0);
              return (
                <div key={prod} className="rounded-xl overflow-hidden"
                  style={{ border: "2px solid oklch(0.88 0.04 75)" }}>
                  {/* Capçalera producte */}
                  <div className="px-4 py-2 flex items-center justify-between"
                    style={{ background: "oklch(0.72 0.08 200 / 0.1)" }}>
                    <p className="font-black text-sm" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.35 0.07 55)" }}>
                      {prod}
                    </p>
                    <span className="font-black text-lg" style={{ color: "oklch(0.45 0.1 200)", fontFamily: "'Nunito', sans-serif" }}>
                      {prodTotal} u.
                    </span>
                  </div>
                  {/* Files de talles */}
                  <div className="divide-y" style={{ borderColor: "oklch(0.93 0.02 75)" }}>
                    {(SIZE_ORDER[prod] || Object.keys(sizes)).map(size => {
                      const qty = sizes[size] || 0;
                      return (
                        <div key={size} className="px-4 py-2 flex items-center justify-between">
                          <span className="text-sm font-semibold" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.05 55)" }}>
                            Talla {size}
                          </span>
                          <span className={`font-black text-base ${
                            qty === 0 ? "text-gray-300" : ""
                          }`} style={{ fontFamily: "'Nunito', sans-serif", color: qty > 0 ? "oklch(0.35 0.07 55)" : undefined }}>
                            {qty > 0 ? qty : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Total global */}
          <div className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: "oklch(0.72 0.08 200 / 0.12)", border: "2px solid oklch(0.72 0.08 200 / 0.3)" }}>
            <p className="font-black text-sm" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.35 0.07 55)" }}>
              TOTAL SAMARRETES
            </p>
            <p className="font-black text-2xl" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.45 0.1 200)" }}>
              {grandTotal} u.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string | null;
  paymentMethod: "transferencia" | "enmà" | "stripe";
  totalPrice: number;
  itemsJson: string;
  pickupPointId: number | null;
  isPaid: number;
  isDelivered: number;
  adminNotes: string | null;
  deliveryEmailSent: number;
  paymentReminderSentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function AdminOrders() {
  const { user, loading: authLoading } = useAuth();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ id: number; text: string } | null>(null);
  const [filterPaid, setFilterPaid] = useState<"all" | "paid" | "unpaid">("all");
  const [filterDelivered, setFilterDelivered] = useState<"all" | "delivered" | "pending">("all");
  const [filterPayment, setFilterPayment] = useState<"all" | "transferencia" | "stripe">("all");
  const [search, setSearch] = useState("");

  const [isExporting, setIsExporting] = useState(false);
  const [sendingReminderId, setSendingReminderId] = useState<number | null>(null);

  const sendPaymentReminderMutation = trpc.orders.sendPaymentReminder.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const { data: orders, isLoading, refetch } = trpc.orders.listAll.useQuery(undefined, {
    refetchInterval: 30_000, // refresca cada 30 segons automàticament
  });

  const exportCSVQuery = trpc.orders.exportCSV.useQuery(undefined, {
    enabled: false, // només s'executa quan es crida manualment
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await exportCSVQuery.refetch();
      if (!result.data?.csv) {
        toast.error("No s'ha pogut generar el CSV");
        return;
      }
      // Crear el fitxer i descarregar-lo
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
      link.href = url;
      link.download = `comandes-el-mar-dins-meu-${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`CSV exportat: ${(orders ?? []).length} comandes`);
    } catch {
      toast.error("Error en exportar el CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Estat actualitzat");
    },
    onError: () => toast.error("Error en actualitzar l'estat"),
  });

  const deleteOrder = trpc.orders.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Comanda eliminada");
    },
    onError: () => toast.error("Error en eliminar la comanda"),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.97 0.02 75)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[oklch(0.72_0.08_200)] border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "oklch(0.97 0.02 75)" }}>
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

  // Filtrar comandes
  const filtered = (orders ?? []).filter((o: Order) => {
    if (filterPaid === "paid" && o.isPaid !== 1) return false;
    if (filterPaid === "unpaid" && o.isPaid !== 0) return false;
    if (filterDelivered === "delivered" && o.isDelivered !== 1) return false;
    if (filterDelivered === "pending" && o.isDelivered !== 0) return false;
    if (filterPayment !== "all" && o.paymentMethod !== filterPayment) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !o.customerName.toLowerCase().includes(q) &&
        !o.customerEmail.toLowerCase().includes(q) &&
        !o.customerPhone.includes(q)
      ) return false;
    }
    return true;
  });

  // Estadístiques ràpides
  const totalOrders = (orders ?? []).length;
  const totalRevenue = (orders ?? []).reduce((sum: number, o: Order) => sum + o.totalPrice, 0);
  const pendingPayment = (orders ?? []).filter((o: Order) => o.isPaid === 0).length;
  const pendingDelivery = (orders ?? []).filter((o: Order) => o.isDelivered === 0).length;

  const togglePaid = (order: Order) => {
    updateStatus.mutate({ id: order.id, isPaid: order.isPaid === 1 ? 0 : 1 });
  };

  const toggleDelivered = (order: Order) => {
    updateStatus.mutate({ id: order.id, isDelivered: order.isDelivered === 1 ? 0 : 1 });
  };

  const saveNotes = (id: number, text: string) => {
    updateStatus.mutate({ id, adminNotes: text });
    setEditingNotes(null);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Segur que vols eliminar la comanda de ${name}?`)) {
      deleteOrder.mutate({ id });
    }
  };

  const paymentLabel = (method: string) =>
    method === "transferencia" ? "Transferència" : method === "stripe" ? "Stripe" : "En mà";

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("ca-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.02 75)" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 shadow-sm" style={{ background: "oklch(0.45 0.1 200)", color: "white" }}>
        <div className="container py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/20"
                style={{ fontFamily: "'Nunito', sans-serif" }}>
                <ArrowLeft size={16} /> Botiga
              </button>
            </Link>
            <h1 className="font-black text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Comandes
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={isExporting || !orders?.length}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Nunito', sans-serif" }}
              title="Exportar totes les comandes a CSV"
            >
              <FileDown size={14} />
              {isExporting ? "Exportant..." : "CSV"}
            </button>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-white/20"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <RefreshCw size={14} /> Actualitzar
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Estadístiques ràpides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total comandes", value: totalOrders, icon: Package, color: "oklch(0.72 0.08 200)" },
            { label: "Ingressos totals", value: `${totalRevenue}€`, icon: CreditCard, color: "oklch(0.6 0.15 145)" },
            { label: "Pendent pagament", value: pendingPayment, icon: Banknote, color: "oklch(0.7 0.15 55)" },
            { label: "Pendent entrega", value: pendingDelivery, icon: PackageCheck, color: "oklch(0.65 0.18 30)" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
              style={{ border: `2px solid ${stat.color}30` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${stat.color}20` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-black leading-none" style={{ color: stat.color, fontFamily: "'Nunito', sans-serif" }}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resum de producció per a la impremta */}
        {orders && orders.length > 0 && (
          <ProductionSummaryBlock orders={orders as Order[]} />
        )}

        {/* Filtres */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-center"
          style={{ border: "2px solid oklch(0.88 0.04 75)" }}>
          {/* Cerca */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nom, email o telèfon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm border outline-none focus:ring-2"
              style={{
                border: "2px solid oklch(0.85 0.04 75)",
                fontFamily: "'Nunito', sans-serif",
                color: "oklch(0.35 0.05 55)",
              }}
            />
          </div>

          {/* Filtre pagament */}
          <select
            value={filterPaid}
            onChange={e => setFilterPaid(e.target.value as typeof filterPaid)}
            className="px-3 py-2 rounded-xl text-sm border outline-none"
            style={{ border: "2px solid oklch(0.85 0.04 75)", fontFamily: "'Nunito', sans-serif", color: "oklch(0.35 0.05 55)" }}
          >
            <option value="all">Tots els pagaments</option>
            <option value="paid">Pagats</option>
            <option value="unpaid">Pendents de pagament</option>
          </select>

          {/* Filtre entrega */}
          <select
            value={filterDelivered}
            onChange={e => setFilterDelivered(e.target.value as typeof filterDelivered)}
            className="px-3 py-2 rounded-xl text-sm border outline-none"
            style={{ border: "2px solid oklch(0.85 0.04 75)", fontFamily: "'Nunito', sans-serif", color: "oklch(0.35 0.05 55)" }}
          >
            <option value="all">Totes les entregues</option>
            <option value="delivered">Entregades</option>
            <option value="pending">Pendents d'entrega</option>
          </select>

          {/* Filtre forma de pagament */}
          <select
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value as typeof filterPayment)}
            className="px-3 py-2 rounded-xl text-sm border outline-none"
            style={{ border: "2px solid oklch(0.85 0.04 75)", fontFamily: "'Nunito', sans-serif", color: "oklch(0.35 0.05 55)" }}
          >
            <option value="all">Totes les formes</option>
            <option value="transferencia">Transferència</option>
            <option value="stripe">Stripe</option>
          </select>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {filtered.length} de {totalOrders} comandes
            </span>
            {filtered.length > 0 && filtered.length < totalOrders && (
              <button
                onClick={() => {
                  // Exportar només les comandes filtrades
                  const paymentLabels: Record<string, string> = {
                    transferencia: "Transferència",
                    "enmà": "En mà",
                  };
                  const headers = ["ID", "Data", "Nom client", "Telèfon", "Email", "Productes", "Total (€)", "Forma de pagament", "Pagat", "Entregat", "Notes client", "Notes internes"];
                  const escape = (val: string | number | null | undefined): string => {
                    if (val === null || val === undefined) return "";
                    const str = String(val);
                    if (str.includes(",") || str.includes('"') || str.includes("\n")) return `"${str.replace(/"/g, '""')}"`;
                    return str;
                  };
                  const rows = filtered.map((o: Order) => {
                    const items: OrderItem[] = JSON.parse(o.itemsJson || "[]");
                    const productsStr = items.map(i => `${i.name} T.${i.size} x${i.quantity}`).join(" | ");
                    const date = new Date(o.createdAt).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                    return [escape(o.id), escape(date), escape(o.customerName), escape(o.customerPhone), escape(o.customerEmail), escape(productsStr), escape(o.totalPrice), escape(paymentLabels[o.paymentMethod] ?? o.paymentMethod), escape(o.isPaid ? "Sí" : "No"), escape(o.isDelivered ? "Sí" : "No"), escape(o.notes), escape(o.adminNotes)].join(",");
                  });
                  const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  const dateStr = new Date().toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
                  link.href = url;
                  link.download = `comandes-filtrades-${dateStr}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast.success(`CSV exportat: ${filtered.length} comandes filtrades`);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: "oklch(0.6 0.15 145 / 0.12)",
                  color: "oklch(0.4 0.12 145)",
                  border: "2px solid oklch(0.6 0.15 145 / 0.3)",
                  fontFamily: "'Nunito', sans-serif",
                }}
                title="Exportar només les comandes filtrades"
              >
                <FileDown size={12} /> Exportar filtrades
              </button>
            )}
          </div>
        </div>

        {/* Llista de comandes */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[oklch(0.72_0.08_200)] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm"
            style={{ border: "2px solid oklch(0.88 0.04 75)" }}>
            <Package size={48} className="mx-auto mb-3 opacity-30" style={{ color: "oklch(0.5 0.05 55)" }} />
            <p className="text-lg font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.5 0.05 55)" }}>
              {totalOrders === 0 ? "Encara no hi ha comandes" : "Cap comanda coincideix amb els filtres"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order: Order) => {
              const items: OrderItem[] = JSON.parse(order.itemsJson || "[]");
              const isExpanded = expandedId === order.id;

              return (
                <div key={order.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all"
                  style={{ border: `2px solid ${order.isPaid && order.isDelivered ? "oklch(0.6 0.15 145 / 0.4)" : "oklch(0.88 0.04 75)"}` }}>

                  {/* Fila principal */}
                  <div className="p-4 flex flex-wrap items-center gap-3">
                    {/* ID + Data */}
                    <div className="flex-shrink-0 text-center w-12">
                      <p className="text-xs font-bold text-gray-400" style={{ fontFamily: "'Nunito', sans-serif" }}>#{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {new Date(order.createdAt).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit" })}
                      </p>
                    </div>

                    {/* Client */}
                    <div className="flex-1 min-w-[140px]">
                      <p className="font-black text-sm" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.3 0.05 55)" }}>
                        {order.customerName}
                      </p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {order.customerPhone}
                      </p>
                      <p className="text-xs text-gray-400" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {order.customerEmail}
                      </p>
                    </div>

                    {/* Productes (resum) */}
                    <div className="flex-1 min-w-[120px]">
                      <p className="text-xs text-gray-500" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {items.map(i => `${i.name} T.${i.size}`).join(", ")}
                      </p>
                    </div>

                    {/* Total + Pagament + Estat */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-black text-lg" style={{ color: "oklch(0.45 0.1 200)", fontFamily: "'Nunito', sans-serif" }}>
                        {order.totalPrice}€
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: order.paymentMethod === "transferencia" ? "oklch(0.72 0.08 200 / 0.15)" : order.paymentMethod === "stripe" ? "oklch(0.72 0.12 280 / 0.15)" : "oklch(0.6 0.15 145 / 0.15)",
                            color: order.paymentMethod === "transferencia" ? "oklch(0.45 0.1 200)" : order.paymentMethod === "stripe" ? "oklch(0.4 0.12 280)" : "oklch(0.4 0.12 145)",
                            fontFamily: "'Nunito', sans-serif",
                          }}>
                          {paymentLabel(order.paymentMethod)}
                        </span>
                        {/* Badge estat pagament */}
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{
                            background: order.isPaid ? "oklch(0.6 0.15 145 / 0.18)" : "oklch(0.7 0.15 55 / 0.18)",
                            color: order.isPaid ? "oklch(0.35 0.12 145)" : "oklch(0.5 0.14 55)",
                            border: `1.5px solid ${order.isPaid ? "oklch(0.6 0.15 145 / 0.4)" : "oklch(0.7 0.15 55 / 0.4)"}`,
                            fontFamily: "'Nunito', sans-serif",
                          }}>
                          {order.isPaid ? "✓ Pagat" : "Pendent"}
                        </span>
                      </div>
                    </div>

                    {/* Botons d'estat */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Pagat */}
                      <button
                        onClick={() => togglePaid(order)}
                        title={order.isPaid ? "Marcar com a no pagat" : "Marcar com a pagat"}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{
                          background: order.isPaid ? "oklch(0.6 0.15 145 / 0.15)" : "oklch(0.9 0.02 75)",
                          color: order.isPaid ? "oklch(0.4 0.12 145)" : "oklch(0.6 0.04 55)",
                          fontFamily: "'Nunito', sans-serif",
                          border: `2px solid ${order.isPaid ? "oklch(0.6 0.15 145 / 0.4)" : "oklch(0.8 0.04 75)"}`,
                        }}
                      >
                        {order.isPaid ? <CheckCircle size={14} /> : <Circle size={14} />}
                        Pagat
                      </button>

                      {/* Entregat */}
                      <button
                        onClick={() => toggleDelivered(order)}
                        title={order.isDelivered ? "Marcar com a no entregat" : "Marcar com a entregat"}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                        style={{
                          background: order.isDelivered ? "oklch(0.72 0.08 200 / 0.15)" : "oklch(0.9 0.02 75)",
                          color: order.isDelivered ? "oklch(0.45 0.1 200)" : "oklch(0.6 0.04 55)",
                          fontFamily: "'Nunito', sans-serif",
                          border: `2px solid ${order.isDelivered ? "oklch(0.72 0.08 200 / 0.4)" : "oklch(0.8 0.04 75)"}`,
                        }}
                      >
                        {order.isDelivered ? <PackageCheck size={14} /> : <Package size={14} />}
                        Entregat
                      </button>

                      {/* Recordatori de pagament — visible només per a comandes de transferència no pagades */}
                      {order.paymentMethod === "transferencia" && !order.isPaid && (
                        <button
                          onClick={async () => {
                            setSendingReminderId(order.id);
                            try {
                              await sendPaymentReminderMutation.mutateAsync({ id: order.id });
                              toast.success(`Recordatori enviat a ${order.customerEmail}`);
                            } catch (err: unknown) {
                              const msg = err instanceof Error ? err.message : "Error desconegut";
                              toast.error(`Error: ${msg}`);
                            } finally {
                              setSendingReminderId(null);
                            }
                          }}
                          disabled={sendingReminderId === order.id}
                          title={order.paymentReminderSentAt
                            ? `Últim recordatori: ${new Date(order.paymentReminderSentAt).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                            : "Enviar recordatori de pagament"}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{
                            background: order.paymentReminderSentAt ? "oklch(0.95 0.05 60 / 0.5)" : "oklch(0.95 0.05 60)",
                            color: "oklch(0.55 0.12 60)",
                            fontFamily: "'Nunito', sans-serif",
                            border: "2px solid oklch(0.82 0.08 60 / 0.5)",
                          }}
                        >
                          {sendingReminderId === order.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Bell size={14} />}
                          {order.paymentReminderSentAt ? "Reenviar" : "Recordatori"}
                        </button>
                      )}

                      {/* Eliminar */}
                      <button
                        onClick={() => handleDelete(order.id, order.customerName)}
                        title="Eliminar comanda"
                        className="p-1.5 rounded-lg transition-all hover:bg-red-50"
                        style={{ color: "oklch(0.55 0.15 30)" }}
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Expandir */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="p-1.5 rounded-lg transition-all hover:bg-gray-100"
                        style={{ color: "oklch(0.6 0.04 55)" }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Detalls expandits */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: "oklch(0.92 0.02 75)" }}>
                      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Productes detallats */}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide mb-2"
                            style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                            Productes
                          </p>
                          <div className="flex flex-col gap-1">
                            {items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl"
                                style={{ background: "oklch(0.96 0.02 75)", fontFamily: "'Nunito', sans-serif" }}>
                                <span style={{ color: "oklch(0.35 0.05 55)" }}>
                                  {item.name} <span className="font-bold">T.{item.size}</span> ×{item.quantity}
                                </span>
                                <span className="font-bold" style={{ color: "oklch(0.45 0.1 200)" }}>
                                  {(item.price * item.quantity).toFixed(0)}€
                                </span>
                              </div>
                            ))}
                          </div>
                          {order.notes && (
                            <div className="mt-2 px-3 py-2 rounded-xl text-sm"
                              style={{ background: "oklch(0.95 0.04 75)", color: "oklch(0.4 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                              <span className="font-bold">Notes del client:</span> {order.notes}
                            </div>
                          )}
                        </div>

                        {/* Notes internes + accions */}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide mb-2"
                            style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                            Notes internes
                          </p>
                          {editingNotes?.id === order.id ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={editingNotes.text}
                                onChange={e => setEditingNotes({ id: order.id, text: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 rounded-xl text-sm border outline-none resize-none"
                                style={{
                                  border: "2px solid oklch(0.72 0.08 200 / 0.4)",
                                  fontFamily: "'Nunito', sans-serif",
                                  color: "oklch(0.35 0.05 55)",
                                }}
                                placeholder="Afegeix notes internes..."
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveNotes(order.id, editingNotes.text)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                                  style={{ background: "oklch(0.6 0.15 145)", fontFamily: "'Nunito', sans-serif" }}
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={() => setEditingNotes(null)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold"
                                  style={{ background: "oklch(0.9 0.02 75)", color: "oklch(0.5 0.04 55)", fontFamily: "'Nunito', sans-serif" }}
                                >
                                  Cancel·lar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => setEditingNotes({ id: order.id, text: order.adminNotes ?? "" })}
                              className="min-h-[60px] px-3 py-2 rounded-xl text-sm cursor-pointer transition-all hover:opacity-80"
                              style={{
                                background: "oklch(0.96 0.02 75)",
                                color: order.adminNotes ? "oklch(0.35 0.05 55)" : "oklch(0.7 0.03 55)",
                                fontFamily: "'Nunito', sans-serif",
                                border: "2px dashed oklch(0.85 0.04 75)",
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <StickyNote size={14} className="mt-0.5 flex-shrink-0 opacity-50" />
                                {order.adminNotes || "Clica per afegir notes internes..."}
                              </div>
                            </div>
                          )}

                          {/* Estat del recordatori de pagament */}
                          {order.paymentMethod === "transferencia" && (
                            <div className="mt-3 flex items-center gap-2">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold"
                                style={{
                                  background: order.paymentReminderSentAt
                                    ? "oklch(0.95 0.05 60 / 0.5)"
                                    : "oklch(0.9 0.02 75)",
                                  color: order.paymentReminderSentAt
                                    ? "oklch(0.55 0.12 60)"
                                    : "oklch(0.6 0.04 55)",
                                  border: `2px solid ${order.paymentReminderSentAt ? "oklch(0.82 0.08 60 / 0.5)" : "oklch(0.82 0.03 75)"}`,
                                  fontFamily: "'Nunito', sans-serif",
                                }}
                                title={order.paymentReminderSentAt
                                  ? `Recordatori enviat el ${new Date(order.paymentReminderSentAt).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                                  : "Encara no s'ha enviat cap recordatori de pagament"}
                              >
                                <Bell size={12} />
                                {order.paymentReminderSentAt
                                  ? `Recordatori enviat: ${new Date(order.paymentReminderSentAt).toLocaleDateString("ca-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
                                  : "Cap recordatori enviat"}
                              </span>
                            </div>
                          )}

                          {/* Estat del correu d'entrega */}
                          <div className="mt-3 flex items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold"
                              style={{
                                background: order.deliveryEmailSent
                                  ? "oklch(0.6 0.15 145 / 0.12)"
                                  : "oklch(0.9 0.02 75)",
                                color: order.deliveryEmailSent
                                  ? "oklch(0.4 0.12 145)"
                                  : "oklch(0.6 0.04 55)",
                                border: `2px solid ${order.deliveryEmailSent ? "oklch(0.6 0.15 145 / 0.3)" : "oklch(0.82 0.03 75)"}`,
                                fontFamily: "'Nunito', sans-serif",
                              }}
                              title={order.deliveryEmailSent
                                ? "El correu de confirmació d'entrega ha estat enviat al client"
                                : "Encara no s'ha enviat el correu d'entrega"}
                            >
                              {order.deliveryEmailSent ? <CheckCircle size={12} /> : <Circle size={12} />}
                              {order.deliveryEmailSent ? "Correu entrega enviat" : "Correu entrega no enviat"}
                            </span>
                          </div>

                          {/* Info de data i eliminar */}
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs text-gray-400" style={{ fontFamily: "'Nunito', sans-serif" }}>
                              {formatDate(order.createdAt)}
                            </p>
                            <button
                              onClick={() => handleDelete(order.id, order.customerName)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
                              style={{
                                background: "oklch(0.95 0.05 30)",
                                color: "oklch(0.55 0.15 30)",
                                fontFamily: "'Nunito', sans-serif",
                                border: "2px solid oklch(0.85 0.08 30 / 0.4)",
                              }}
                            >
                              <Trash2 size={12} /> Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
