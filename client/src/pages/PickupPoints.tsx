import { trpc } from "@/lib/trpc";
import { MapPin, Phone, Clock, Mail, MessageCircle, Globe, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { PickupPointsLoadingSkeleton } from "@/components/PickupPointsLoadingSkeleton";

const TYPE_CONFIG = {
  botiga:     { label: "Botiga",      icon: "🏪", accent: "oklch(0.55 0.12 200)", badgeBg: "oklch(0.93 0.04 200)", badgeColor: "oklch(0.38 0.10 200)" },
  associacio: { label: "Associació",  icon: "🤝", accent: "oklch(0.50 0.18 150)", badgeBg: "oklch(0.92 0.07 150)", badgeColor: "oklch(0.34 0.14 150)" },
  entitat:    { label: "Entitat",     icon: "🏢", accent: "oklch(0.60 0.14 65)",  badgeBg: "oklch(0.94 0.06 70)",  badgeColor: "oklch(0.42 0.12 60)"  },
  altra:      { label: "Altra",       icon: "✨", accent: "oklch(0.55 0.14 290)", badgeBg: "oklch(0.93 0.06 290)", badgeColor: "oklch(0.40 0.12 290)" },
} as const;

export default function PickupPointsPage() {
  const { data: pickupPoints = [], isLoading } = trpc.pickupPoints.listApproved.useQuery();

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.96 0.015 65)" }}>
      {/* Header */}
      <header className="py-12" style={{ background: "oklch(0.72 0.08 200)" }}>
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 mb-5 text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: "rgba(255,255,255,0.8)" }}>
            ← Torna a l'inici
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Punts de recollida
          </h1>
          <p className="text-lg max-w-xl mb-5" style={{ color: "rgba(255,255,255,0.88)", fontFamily: "'Nunito', sans-serif" }}>
            Recull les teves samarretes en un dels nostres punts de confiança
          </p>
          {!isLoading && pickupPoints.length > 0 && (
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              📍 {pickupPoints.length} {pickupPoints.length === 1 ? "punt disponible" : "punts disponibles"}
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="container py-12">
        {isLoading ? (
          <PickupPointsLoadingSkeleton />
        ) : pickupPoints.length === 0 ? (
          <div className="rounded-3xl p-10 text-center" style={{ background: "white", border: "2px solid oklch(0.88 0.04 70)" }}>
            <p className="text-6xl mb-4">📭</p>
            <p className="text-xl font-bold mb-3" style={{ color: "oklch(0.35 0.07 55)" }}>
              Encara no hi ha punts de recollida registrats
            </p>
            <p className="text-sm" style={{ color: "oklch(0.55 0.05 55)" }}>
              Si ets una entitat, botiga o associació i vols col·laborar,{" "}
              <Link href="/registre-punt-recollida" className="font-bold underline" style={{ color: "oklch(0.72 0.08 200)" }}>
                registra't aquí
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            {/* Grid de targes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pickupPoints.map((point) => {
                const typeConf = TYPE_CONFIG[point.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.altra;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${point.address}, ${point.city}`)}`;

                return (
                  <div
                    key={point.id}
                    className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: "white",
                      border: "1.5px solid oklch(0.89 0.04 70)",
                      boxShadow: "0 2px 12px oklch(0.70 0.05 70 / 0.12)",
                    }}
                  >
                    {/* Barra de color per tipus */}
                    <div style={{ height: 5, background: typeConf.accent }} />

                    {/* Capçalera */}
                    <div className="px-6 pt-5 pb-4">
                      <h3
                        className="text-xl font-black leading-tight mb-3"
                        style={{ color: "oklch(0.28 0.06 50)", fontFamily: "'Playfair Display', serif" }}
                      >
                        {point.name}
                      </h3>
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                        style={{ background: typeConf.badgeBg, color: typeConf.badgeColor }}
                      >
                        {typeConf.icon} {typeConf.label}
                      </span>
                    </div>

                    {/* Separador */}
                    <div style={{ height: 1, background: "oklch(0.91 0.03 70)", margin: "0 24px" }} />

                    {/* Dades de contacte */}
                    <div className="px-6 py-4 flex-1 space-y-2.5">
                      {/* Adreça + link mapes */}
                      <div className="flex gap-3 text-sm">
                        <MapPin size={16} style={{ color: typeConf.accent, flexShrink: 0, marginTop: 2 }} />
                        <div className="flex-1 min-w-0">
                          <p
                            className="leading-snug"
                            style={{
                              color: "oklch(0.40 0.05 55)",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                            title={point.address}
                          >
                            {point.address}
                          </p>
                          {point.city && (
                            <p className="mt-0.5" style={{ color: "oklch(0.55 0.04 55)" }}>
                              {point.postalCode} {point.city}
                            </p>
                          )}
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-xs font-semibold hover:underline"
                            style={{ color: typeConf.accent }}
                          >
                            <ExternalLink size={11} />
                            Veure al mapa
                          </a>
                        </div>
                      </div>

                      {/* Telèfon */}
                      {point.phone && (
                        <div className="flex gap-3 text-sm items-center">
                          <Phone size={16} style={{ color: typeConf.accent, flexShrink: 0 }} />
                          <a
                            href={`tel:${point.phone}`}
                            className="hover:underline font-medium"
                            style={{ color: "oklch(0.40 0.05 55)" }}
                          >
                            {point.phone}
                          </a>
                        </div>
                      )}

                      {/* Email */}
                      {point.email && (
                        <div className="flex gap-3 text-sm items-center">
                          <Mail size={16} style={{ color: typeConf.accent, flexShrink: 0 }} />
                          <a
                            href={`mailto:${point.email}`}
                            className="hover:underline truncate"
                            style={{ color: "oklch(0.40 0.05 55)" }}
                          >
                            {point.email}
                          </a>
                        </div>
                      )}

                      {/* Web */}
                      {point.website && (
                        <div className="flex gap-3 text-sm items-center">
                          <Globe size={16} style={{ color: typeConf.accent, flexShrink: 0 }} />
                          <a
                            href={point.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate"
                            style={{ color: "oklch(0.40 0.05 55)" }}
                          >
                            {point.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}

                      {/* Horari */}
                      {point.openingHours && (
                        <div className="flex gap-3 text-sm items-start">
                          <Clock size={16} style={{ color: typeConf.accent, flexShrink: 0, marginTop: 1 }} />
                          <p style={{ color: "oklch(0.50 0.04 55)" }}>{point.openingHours}</p>
                        </div>
                      )}
                    </div>

                    {/* Separador inferior — sempre present */}
                    <div style={{ height: 1, background: "oklch(0.91 0.03 70)", margin: "0 24px" }} />

                    {/* Descripció */}
                    <div className="px-6 py-4">
                      {point.description ? (
                        <p className="text-sm leading-relaxed" style={{ color: "oklch(0.52 0.05 55)" }}>
                          {point.description}
                        </p>
                      ) : (
                        <p className="text-sm italic" style={{ color: "oklch(0.72 0.03 55)" }}>
                          Punt de recollida oficial del projecte
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-16">
              <div
                className="rounded-3xl p-10 text-center"
                style={{ background: "oklch(0.72 0.08 200 / 0.07)", border: "2px solid oklch(0.72 0.08 200 / 0.25)" }}
              >
                <h3
                  className="text-2xl font-black mb-3"
                  style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.28 0.06 50)" }}
                >
                  Vols ser part del moviment?
                </h3>
                <p className="text-sm mb-7 max-w-2xl mx-auto" style={{ color: "oklch(0.50 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                  Si ets una entitat, botiga o associació, pots oferir-te com a punt de recollida. Juntes trenquem silencis i construïm comunitat.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                  <Link
                    href="/registre-punt-recollida"
                    className="inline-block px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ background: "oklch(0.72 0.08 200)", color: "white" }}
                  >
                    Registra't com a punt de recollida
                  </Link>
                  <a
                    href="https://wa.me/?text=Hola%21%20M%27interessa%20ser%20punt%20de%20recollida%20del%20projecte%20El%20Mar%20dins%20Meu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                    style={{ background: "oklch(0.72 0.08 200 / 0.12)", color: "oklch(0.42 0.10 200)", border: "2px solid oklch(0.72 0.08 200 / 0.4)" }}
                  >
                    <MessageCircle size={18} />
                    Contacta per WhatsApp
                  </a>
                  <a
                    href="mailto:escoltem@elmardinsmeu.cat?subject=Vull%20ser%20punt%20de%20recollida&body=Hola%21%20M%27interessa%20ser%20punt%20de%20recollida%20del%20projecte%20El%20Mar%20dins%20Meu."
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90"
                    style={{ background: "oklch(0.72 0.08 200 / 0.12)", color: "oklch(0.42 0.10 200)", border: "2px solid oklch(0.72 0.08 200 / 0.4)" }}
                  >
                    <Mail size={18} />
                    Contacta per email
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
