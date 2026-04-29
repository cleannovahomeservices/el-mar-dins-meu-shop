/* =============================================================
   CheckoutModal — El Mar dins Meu
   Modal de finalització de comanda amb opcions de pagament:
   Transferència bancària, Pagament en mà, Stripe
   Les comandes s'envien per correu a elmardinsmeu@gmail.com
   ============================================================= */

import { useState, useEffect } from "react";
import { X, CheckCircle, Building2, Mail, MapPin, CreditCard, Truck } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  items: CartItem[];
  totalPrice: number;
  onClose: () => void;
}

type PaymentMethod = "transferencia" | "stripe";
type DeliveryMethod = "pickup" | "home";

export default function CheckoutModal({ items, totalPrice, onClose }: Props) {
  const { clearCart, selectedPickupPointId, setSelectedPickupPointId } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const { data: pickupPoints = [] } = trpc.pickupPoints.listApproved.useQuery();

  const submitOrderMutation = trpc.orders.submit.useMutation({
    onSuccess: () => {
      setCustomerName(form.name);
      clearCart();
      setSubmitted(true);
    },
    onError: () => {
      toast.error("Hi ha hagut un error en enviar la comanda. Torna-ho a intentar.");
    },
  });

  const createCheckoutSessionMutation = trpc.checkout.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
        toast.success("Redirigint a Stripe per completar el pagament...");
        setTimeout(() => {
          clearCart();
          onClose();
        }, 1500);
      }
    },
    onError: () => {
      toast.error("Error en crear la sessió de pagament. Torna-ho a intentar.");
    },
  });

  const shippingCost = deliveryMethod === "home" ? (totalPrice >= 50 ? 0 : 5) : 0;
  const totalWithShipping = totalPrice + shippingCost;

  const handleSubmit = () => {
    const hasPickup = deliveryMethod === "pickup" ? Boolean(selectedPickupPointId) : true;
    const hasHomeAddress =
      deliveryMethod === "home"
        ? Boolean(shippingAddress.trim() && shippingCity.trim() && shippingPostalCode.trim())
        : true;
    if (!form.name || !form.phone || !form.email || !paymentMethod || !hasPickup || !hasHomeAddress) return;

    const fullNotes = [
      form.notes?.trim(),
      deliveryMethod === "home"
        ? `Enviament a domicili: ${shippingAddress.trim()}, ${shippingPostalCode.trim()} ${shippingCity.trim()}`
        : "Recollida gratuïta en punt de recollida",
    ]
      .filter(Boolean)
      .join("\n");

    if (paymentMethod === 'stripe') {
      // Create Stripe checkout session
      createCheckoutSessionMutation.mutate({
        customerName: form.name,
        customerEmail: form.email,
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        pickupPointId: deliveryMethod === "pickup" ? selectedPickupPointId : undefined,
        origin: window.location.origin,
      });
    } else {
      // Submit order directly for bank transfer
      submitOrderMutation.mutate({
        name: form.name,
        phone: form.phone,
        email: form.email,
        notes: fullNotes || undefined,
        paymentMethod,
        pickupPointId: deliveryMethod === "pickup" ? selectedPickupPointId ?? undefined : undefined,
        items: items.map(i => ({
          name: i.name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        totalPrice: totalWithShipping,
      });
    }
  };

  const paymentOptions: { id: PaymentMethod; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: "stripe",
      label: "Pagar amb targeta",
      desc: "Pagament segur amb Stripe (Visa, Mastercard, etc.)",
      icon: <CreditCard size={22} className="text-[oklch(0.55_0.1_200)]" />,
    },
    {
      id: "transferencia",
      label: "Transferència bancària",
      desc: "Un cop confirmada la comanda, us enviarem les dades de pagament",
      icon: <Building2 size={22} className="text-[oklch(0.55_0.1_200)]" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ animation: "fadeScaleIn 0.3s ease" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[oklch(0.9_0.03_75)]"
          style={{ background: "oklch(0.65 0.1 200)" }}>
          <h2 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            {submitted ? "Comanda enviada!" : "Finalitzar encàrrec"}
          </h2>
          <button onClick={onClose} className="text-white hover:opacity-70 transition-opacity">
            <X size={22} />
          </button>
        </div>

        {submitted ? (
          /* Confirmació */
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} className="text-[oklch(0.55_0.1_200)]" />
            </div>
            <h3 className="text-2xl font-bold text-[oklch(0.3_0.06_50)] mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Gràcies, {customerName}!
            </h3>
            <p className="text-[oklch(0.5_0.04_55)] mb-2">
              La teva comanda s'ha enviat correctament.
            </p>
            <p className="text-[oklch(0.5_0.04_55)] text-sm mb-2">
              Hem enviat un correu de confirmació a <strong>{form.email || customerName}</strong> amb els detalls de la comanda.
            </p>
            <p className="text-[oklch(0.5_0.04_55)] text-sm mb-6">
              Ens posarem en contacte amb tu ben aviat per confirmar els detalls.
            </p>
            <button
              onClick={onClose}
              className="btn-primary px-8 py-3 rounded-xl font-bold"
            >
              Tancar
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Resum comanda */}
            <div>
              <h3 className="font-bold text-[oklch(0.3_0.06_50)] mb-3 text-sm uppercase tracking-wide">
                Resum de la comanda
              </h3>
              <div className="bg-[oklch(0.96_0.02_80)] rounded-xl p-4 space-y-2">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-[oklch(0.4_0.05_55)]">
                      {item.name} (T. {item.size}) ×{item.quantity}
                    </span>
                    <span className="font-bold text-[oklch(0.35_0.07_55)]">
                      {(item.price * item.quantity).toFixed(0)}€
                    </span>
                  </div>
                ))}
                <div className="border-t border-[oklch(0.85_0.04_75)] pt-2 flex justify-between text-sm">
                  <span className="text-[oklch(0.3_0.06_50)]">Enviament</span>
                  <span className="font-semibold text-[oklch(0.35_0.07_55)]">
                    {deliveryMethod === "home" ? `${shippingCost.toFixed(0)}€` : "Gratuït"}
                  </span>
                </div>
                <div className="border-t border-[oklch(0.85_0.04_75)] pt-2 flex justify-between font-bold">
                  <span className="text-[oklch(0.3_0.06_50)]">Total final</span>
                  <span className="text-[oklch(0.35_0.07_55)] text-lg"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    {totalWithShipping.toFixed(0)}€
                  </span>
                </div>
              </div>
            </div>

            {/* Dades de contacte */}
            <div>
              <h3 className="font-bold text-[oklch(0.3_0.06_50)] mb-3 text-sm uppercase tracking-wide">
                Les teves dades
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[oklch(0.45_0.05_55)] mb-1 block">
                    Nom i cognoms *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="El teu nom complet"
                    className="w-full border-2 border-[oklch(0.85_0.04_75)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.55_0.1_200)] transition-colors"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[oklch(0.45_0.05_55)] mb-1 block">
                    Telèfon *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="6XX XXX XXX"
                    className="w-full border-2 border-[oklch(0.85_0.04_75)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.55_0.1_200)] transition-colors"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[oklch(0.45_0.05_55)] mb-1 block">
                    Correu electrònic *
                    <span className="ml-2 font-normal text-[oklch(0.55_0.1_200)]">(rebràs la confirmació aquí)</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="correu@exemple.com"
                    required
                    className="w-full border-2 border-[oklch(0.85_0.04_75)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.55_0.1_200)] transition-colors"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[oklch(0.45_0.05_55)] mb-1 block">
                    Notes o comentaris
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Algun comentari sobre la comanda..."
                    rows={2}
                    className="w-full border-2 border-[oklch(0.85_0.04_75)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.55_0.1_200)] transition-colors resize-none"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  />
                </div>
              </div>
            </div>

            {/* Opció d'enviament */}
            <div>
              <h3 className="font-bold text-[oklch(0.3_0.06_50)] mb-3 text-sm uppercase tracking-wide">
                Enviament *
              </h3>
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setDeliveryMethod("home")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    deliveryMethod === "home"
                      ? "border-[oklch(0.55_0.1_200)] bg-[oklch(0.92_0.04_200)]"
                      : "border-[oklch(0.85_0.04_75)] bg-[oklch(0.97_0.02_80)] hover:border-[oklch(0.7_0.08_200)]"
                  }`}
                >
                  <Truck size={22} className="text-[oklch(0.55_0.1_200)]" />
                  <div className="flex-1">
                    <div className="font-bold text-[oklch(0.3_0.06_50)] text-sm">Enviament a domicili</div>
                    <div className="text-xs text-[oklch(0.55_0.04_55)]">5€ · Gratuït a partir de 50€</div>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    deliveryMethod === "pickup"
                      ? "border-[oklch(0.55_0.1_200)] bg-[oklch(0.92_0.04_200)]"
                      : "border-[oklch(0.85_0.04_75)] bg-[oklch(0.97_0.02_80)] hover:border-[oklch(0.7_0.08_200)]"
                  }`}
                >
                  <MapPin size={22} className="text-[oklch(0.55_0.1_200)]" />
                  <div className="flex-1">
                    <div className="font-bold text-[oklch(0.3_0.06_50)] text-sm">Recollida gratuïta</div>
                    <div className="text-xs text-[oklch(0.55_0.04_55)]">Tria un punt de recollida</div>
                  </div>
                </button>
              </div>
            </div>

            {deliveryMethod === "home" ? (
              <div>
                <h3 className="font-bold text-[oklch(0.3_0.06_50)] mb-3 text-sm uppercase tracking-wide">
                  Adreça d'enviament *
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={shippingAddress}
                    onChange={e => setShippingAddress(e.target.value)}
                    placeholder="Carrer i número"
                    className="w-full border-2 border-[oklch(0.85_0.04_75)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.55_0.1_200)] transition-colors"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={shippingPostalCode}
                      onChange={e => setShippingPostalCode(e.target.value)}
                      placeholder="Codi postal"
                      className="w-full border-2 border-[oklch(0.85_0.04_75)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.55_0.1_200)] transition-colors"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    />
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={e => setShippingCity(e.target.value)}
                      placeholder="Població"
                      className="w-full border-2 border-[oklch(0.85_0.04_75)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.55_0.1_200)] transition-colors"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-[oklch(0.3_0.06_50)] mb-3 text-sm uppercase tracking-wide">
                  Punt de recollida *
                </h3>
                <div className="space-y-2">
                  {pickupPoints.length === 0 ? (
                    <p className="text-sm text-[oklch(0.5_0.04_55)] p-3 bg-[oklch(0.96_0.02_80)] rounded-xl">
                      No hi ha punts de recollida disponibles. Torna-ho a intentar més tard.
                    </p>
                  ) : (
                    pickupPoints.map(point => (
                      <button
                        key={point.id}
                        onClick={() => setSelectedPickupPointId(point.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          selectedPickupPointId === point.id
                            ? "border-[oklch(0.55_0.1_200)] bg-[oklch(0.92_0.04_200)]"
                            : "border-[oklch(0.85_0.04_75)] bg-[oklch(0.97_0.02_80)] hover:border-[oklch(0.7_0.08_200)]"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <MapPin size={22} className="text-[oklch(0.55_0.1_200)]" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-[oklch(0.3_0.06_50)] text-sm">{point.name}</div>
                          <div className="text-xs text-[oklch(0.55_0.04_55)]">{point.address}</div>
                        </div>
                        {selectedPickupPointId === point.id && (
                          <CheckCircle size={18} className="ml-auto flex-shrink-0 text-[oklch(0.55_0.1_200)]" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Mètode de pagament */}
            <div>
              <h3 className="font-bold text-[oklch(0.3_0.06_50)] mb-3 text-sm uppercase tracking-wide">
                Forma de pagament *
              </h3>
              <div className="space-y-2">
                {paymentOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === opt.id
                        ? "border-[oklch(0.55_0.1_200)] bg-[oklch(0.92_0.04_200)]"
                        : "border-[oklch(0.85_0.04_75)] bg-[oklch(0.97_0.02_80)] hover:border-[oklch(0.7_0.08_200)]"
                    }`}
                  >
                    <div className="flex-shrink-0">{opt.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-[oklch(0.3_0.06_50)] text-sm">{opt.label}</div>
                      <div className="text-xs text-[oklch(0.55_0.04_55)]">{opt.desc}</div>
                    </div>
                    {paymentMethod === opt.id && (
                      <CheckCircle size={18} className="ml-auto flex-shrink-0 text-[oklch(0.55_0.1_200)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Botó enviar */}
            <button
              onClick={handleSubmit}
              disabled={
                !form.name ||
                !form.phone ||
                !form.email ||
                !paymentMethod ||
                (deliveryMethod === "pickup" && !selectedPickupPointId) ||
                (deliveryMethod === "home" && (!shippingAddress || !shippingCity || !shippingPostalCode)) ||
                submitOrderMutation.isPending ||
                createCheckoutSessionMutation.isPending
              }
              className="w-full btn-primary py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitOrderMutation.isPending || createCheckoutSessionMutation.isPending ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {paymentMethod === 'stripe' ? 'Redirigint...' : 'Enviant...'}</>
              ) : paymentMethod === 'stripe' ? (
                <><CreditCard size={18} /> Anar a Stripe</>
              ) : (
                <><Mail size={18} /> Enviar comanda</>
              )}
            </button>

            <div className="text-center space-y-1">
              <p className="text-xs text-[oklch(0.6_0.04_55)]">
                ⏳ <strong>Preventa</strong> — La comanda es recollirà a partir de Maig 2026.
              </p>
              <p className="text-xs text-[oklch(0.6_0.04_55)]">
                Rebràs un correu de confirmació automàtic amb els detalls de la comanda.
              </p>
              <p className="text-xs text-[oklch(0.6_0.04_55)]">
                El pagament es gestiona a través del nostre compte.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
