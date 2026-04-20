/* =============================================================
   CheckoutSuccess — El Mar dins Meu
   Página de confirmación después de pago exitoso con Stripe
   ============================================================= */

import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "wouter";
import { CheckCircle, Package, MapPin, Mail, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const [, navigate] = useLocation();
  const sessionId = searchParams.get('session_id');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    // In a real app, you would fetch the order details from your backend
    // For now, we'll just show a success message
    setLoading(false);
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[oklch(0.96_0.03_75)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-[oklch(0.55_0.1_200)] mb-4" />
          <p className="text-[oklch(0.5_0.04_55)]">Processant pagament...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.96_0.03_75)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[oklch(0.55_0.1_200)] rounded-full opacity-20 animate-pulse" />
              <CheckCircle size={80} className="text-[oklch(0.55_0.1_200)] relative" />
            </div>
          </div>

          <h1
            className="text-4xl font-bold text-center text-[oklch(0.3_0.06_50)] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Pagament rebut!
          </h1>

          <p className="text-center text-[oklch(0.5_0.04_55)] mb-8">
            Gràcies per la teva comanda. El pagament s'ha processat correctament.
          </p>

          {/* Order Details */}
          <div className="bg-[oklch(0.96_0.02_80)] rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-[oklch(0.55_0.1_200)] mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[oklch(0.4_0.05_55)]">Confirmació per correu</p>
                <p className="text-sm text-[oklch(0.5_0.04_55)]">
                  Hem enviat els detalls de la comanda al teu correu electrònic.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package size={20} className="text-[oklch(0.55_0.1_200)] mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[oklch(0.4_0.05_55)]">Estat de la comanda</p>
                <p className="text-sm text-[oklch(0.5_0.04_55)]">
                  Pots consultar l'estat de la teva comanda a la secció "Les meves comandes".
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-[oklch(0.55_0.1_200)] mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[oklch(0.4_0.05_55)]">Recollida</p>
                <p className="text-sm text-[oklch(0.5_0.04_55)]">
                  La comanda es recollirà a partir de Maig 2026 al punt de recollida que has seleccionat.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-[oklch(0.92_0.04_200)] rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-[oklch(0.3_0.06_50)] mb-3">Pròxims passos:</h3>
            <ol className="space-y-2 text-sm text-[oklch(0.4_0.05_55)]">
              <li className="flex gap-2">
                <span className="font-bold text-[oklch(0.55_0.1_200)]">1.</span>
                <span>Rebràs un correu de confirmació amb els detalls de la comanda.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[oklch(0.55_0.1_200)]">2.</span>
                <span>Ens posarem en contacte per confirmar els detalls de recollida.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-[oklch(0.55_0.1_200)]">3.</span>
                <span>La comanda estarà disponible per recollir a partir de Maig 2026.</span>
              </li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/comandes")}
              className="flex-1 btn-primary py-3 rounded-xl font-bold transition-all hover:opacity-90"
            >
              Veure les meves comandes
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-6 py-3 rounded-xl font-bold border-2 border-[oklch(0.55_0.1_200)] text-[oklch(0.55_0.1_200)] hover:bg-[oklch(0.92_0.04_200)] transition-all"
            >
              Tornar a l'inici
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-sm text-[oklch(0.5_0.04_55)] mb-3">
            Tens alguna pregunta sobre la teva comanda?
          </p>
          <a
            href="https://wa.me/34XXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 rounded-lg bg-[oklch(0.65_0.15_150)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Contacta'ns per WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
