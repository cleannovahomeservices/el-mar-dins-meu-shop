import { trpc } from "@/lib/trpc";
import { MapPin, Phone, Clock, Mail, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { PickupPointsMap } from "@/components/PickupPointsMap";
import { PickupPointsLoadingSkeleton } from "@/components/PickupPointsLoadingSkeleton";

export default function PickupPointsPage() {
  const { data: pickupPoints = [], isLoading } = trpc.pickupPoints.listApproved.useQuery();

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.97 0.01 55)" }}>
      {/* Header */}
      <header className="py-6" style={{ background: "oklch(0.72 0.08 200)" }}>
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 text-white hover:opacity-80">
            <span>←</span> Torna a l'inici
          </Link>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Punts de recollida
          </h1>
          <p className="text-white/90 mt-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Recull les teves samarretes en un dels nostres punts de confiança
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12">
        {isLoading ? (
          <PickupPointsLoadingSkeleton />
        ) : pickupPoints.length === 0 ? (
          <div className="rounded-3xl p-8 text-center" style={{ background: "white", border: "2px solid oklch(0.78 0.07 70 / 0.5)" }}>
            <p className="text-lg font-semibold mb-4" style={{ color: "oklch(0.35 0.07 55)" }}>
              Actualment no hi ha punts de recollida registrats.
            </p>
            <p className="text-sm" style={{ color: "oklch(0.5 0.05 55)" }}>
              Si ets una entitat, botiga o associació i vols oferir-te com a punt de recollida,{" "}
              <Link href="/registre-punt-recollida" className="font-bold underline" style={{ color: "oklch(0.72 0.08 200)" }}>
                registra't aquí
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            {/* Mapa interactiu */}
            <div className="mb-12">
              <h2 className="text-2xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
                📍 Ubicacions dels punts de recollida
              </h2>
              <PickupPointsMap pickupPoints={pickupPoints} isLoading={isLoading} />
            </div>

            <div className="mb-8 p-6 rounded-2xl" style={{ background: "oklch(0.88 0.06 75 / 0.5)" }}>
              <p className="text-sm font-semibold" style={{ color: "oklch(0.35 0.07 55)", fontFamily: "'Nunito', sans-serif" }}>
                📍 {pickupPoints.length} {pickupPoints.length === 1 ? "punt de recollida" : "punts de recollida"} disponibles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pickupPoints.map((point) => (
                <div
                  key={point.id}
                  className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                  style={{ background: "white", border: "2px solid oklch(0.78 0.07 70 / 0.5)" }}
                >
                  {/* Nom */}
                  <h3 className="text-xl font-black mb-2" style={{ color: "oklch(0.35 0.07 55)", fontFamily: "'Playfair Display', serif" }}>
                    {point.name}
                  </h3>

                  {/* Tipus */}
                  <p className="text-xs font-bold uppercase mb-4 px-3 py-1 rounded-full inline-block" style={{ background: "oklch(0.72 0.08 200 / 0.1)", color: "oklch(0.72 0.08 200)" }}>
                    {point.type === "botiga" && "🏪 Botiga"}
                    {point.type === "associacio" && "🤝 Associació"}
                    {point.type === "entitat" && "🏢 Entitat"}
                    {point.type === "altra" && "✨ Altra"}
                  </p>

                  {/* Ubicació */}
                  {point.address && (
                    <div className="flex gap-3 mb-3 text-sm">
                      <MapPin size={18} style={{ color: "oklch(0.72 0.08 200)", flexShrink: 0 }} />
                      <p style={{ color: "oklch(0.5 0.05 55)" }}>{point.address}</p>
                    </div>
                  )}

                  {/* Telèfon */}
                  {point.phone && (
                    <div className="flex gap-3 mb-3 text-sm">
                      <Phone size={18} style={{ color: "oklch(0.72 0.08 200)", flexShrink: 0 }} />
                      <a href={`tel:${point.phone}`} className="hover:underline" style={{ color: "oklch(0.72 0.08 200)" }}>
                        {point.phone}
                      </a>
                    </div>
                  )}

                  {/* Email */}
                  {point.email && (
                    <div className="flex gap-3 mb-3 text-sm">
                      <Mail size={18} style={{ color: "oklch(0.72 0.08 200)", flexShrink: 0 }} />
                      <a href={`mailto:${point.email}`} className="hover:underline" style={{ color: "oklch(0.72 0.08 200)" }}>
                        {point.email}
                      </a>
                    </div>
                  )}

                  {/* Horari */}
                  {point.openingHours && (
                    <div className="flex gap-3 mb-4 text-sm">
                      <Clock size={18} style={{ color: "oklch(0.72 0.08 200)", flexShrink: 0 }} />
                      <p style={{ color: "oklch(0.5 0.05 55)" }}>{point.openingHours}</p>
                    </div>
                  )}

                  {/* Descripció */}
                  {point.description && (
                    <p className="text-sm mt-4 pt-4 border-t" style={{ color: "oklch(0.5 0.05 55)", borderColor: "oklch(0.78 0.07 70 / 0.3)" }}>
                      {point.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-12">
              <div className="rounded-3xl p-8" style={{ background: "oklch(0.72 0.08 200 / 0.08)", border: "2px solid oklch(0.72 0.08 200 / 0.3)" }}>
                <div className="text-center">
                  <h3 className="text-2xl font-black mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
                    Vols ser part del moviment?
                  </h3>
                  <p className="text-sm mb-6 max-w-2xl mx-auto" style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                    Si ets una entitat, botiga o associació, pots oferir-te com a punt de recollida. Juntes trenquem silencis i construïm comunitat. Contacta'ns per WhatsApp, email o registra't formalment.
                  </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                  <Link
                    href="/registre-punt-recollida"
                    className="inline-block px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                    style={{ background: "oklch(0.72 0.08 200)", color: "white" }}
                  >
                    Registra't com a punt de recollida
                  </Link>
                  <a
                    href="https://wa.me/?text=Hola%21%20M%27interessa%20ser%20punt%20de%20recollida%20del%20projecte%20El%20Mar%20dins%20Meu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                    style={{ background: "oklch(0.72 0.08 200 / 0.2)", color: "oklch(0.72 0.08 200)", border: "2px solid oklch(0.72 0.08 200)" }}
                  >
                    <MessageCircle size={18} />
                    Contacta per WhatsApp
                  </a>
                  <a
                    href="mailto:escoltem@elmardinsmeu.cat?subject=Vull%20ser%20punt%20de%20recollida&body=Hola%21%20M%27interessa%20ser%20punt%20de%20recollida%20del%20projecte%20El%20Mar%20dins%20Meu."
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                    style={{ background: "oklch(0.72 0.08 200 / 0.2)", color: "oklch(0.72 0.08 200)", border: "2px solid oklch(0.72 0.08 200)" }}
                  >
                    <Mail size={18} />
                    Contacta per email
                  </a>
                </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
