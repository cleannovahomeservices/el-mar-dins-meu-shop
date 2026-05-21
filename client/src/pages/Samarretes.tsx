/* =============================================================
   Samarretes — El Mar dins Meu
   Pàgina independent: /samarretes
   Només mostra el catàleg de samarretes + cistella
   ============================================================= */

import { useState, useRef } from "react";
import { Link } from "wouter";
import { ShoppingBag, ChevronDown, ChevronUp, LayoutGrid, Package, Star, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import CartDrawer from "@/components/CartDrawer";
import ProductCard, { Product } from "@/components/ProductCard";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS";

const IMGS = {
  noiInterior:     `${CDN}/samarreta_noi_interior_nova_e1a4f154.png`,
  noiExterior:     `${CDN}/samarreta_noi_exterior_nova_3890a708.png`,
  noia:            `${CDN}/samarreta_noia_real_0a3b22c7.jpg`,
  noiaExterior:    `${CDN}/noia_exterior_28cca105.jpg`,
  tirantsFrontal:  `${CDN}/tirants_frontal_749e359c.jpg`,
  tirantsEsquena:  `${CDN}/tirants_esquena_nova_0aa85d8d.jpg`,
  tirantsEsquena2: `${CDN}/tirants_esquena2_9c12192b.jpg`,
  infantil1:       `${CDN}/infantil_nena_nova_ac666b14.jpg`,
  infantil2:       `${CDN}/infantil_nena2_6f81c493.jpg`,
  tallaNoi:        `${CDN}/taula_talles_noi_056863df.jpg`,
  tallaNoia:       `${CDN}/taula_talles_noia_2980b7fb.jpg`,
  tallaTirants:    `${CDN}/taula_talles_tirants_5490a192.jpg`,
};

const LEMA_INTOCABLES = `${CDN}/lema_intocables_d670505c.jpg`;
const LEMA_MONSTRES   = `${CDN}/lema_monstres_por_hq_58967abc.jpg`;

const PRODUCTS: Product[] = [
  {
    id: "samarreta-noi",
    name: "Samarreta Ampla",
    subtitle: "El Mar dins Meu",
    price: 18,
    preventa: true,
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    images: [IMGS.noiInterior, IMGS.noiExterior],
    sizeGuideImg: IMGS.tallaNoi,
    rotation: -1.5,
    available: true,
  },
  {
    id: "samarreta-noia",
    name: "Samarreta Entallada",
    subtitle: "El Mar dins Meu",
    price: 18,
    preventa: true,
    sizes: ["S", "M", "L", "XL", "2XL"],
    images: [IMGS.noia, IMGS.noiaExterior],
    sizeGuideImg: IMGS.tallaNoia,
    rotation: 1.5,
    available: true,
  },
  {
    id: "samarreta-tirants",
    name: "Samarreta Tirants",
    subtitle: "El Mar dins Meu",
    price: 18,
    preventa: true,
    sizes: ["S", "M", "L", "XL", "2XL"],
    images: [IMGS.tirantsFrontal, IMGS.tirantsEsquena, IMGS.tirantsEsquena2],
    sizeGuideImg: IMGS.tallaTirants,
    rotation: -1,
    available: true,
  },
  {
    id: "samarreta-infantil",
    name: "Samarreta Infantil",
    subtitle: "El Mar dins Meu",
    price: 15,
    preventa: true,
    sizes: ["3/4", "5/6", "7/8", "9/10", "11/12"],
    images: [IMGS.infantil1, IMGS.infantil2],
    sizeGuideImg: IMGS.tallaNoi,
    rotation: 1,
    available: true,
  },
];

// ── Lightbox amb zoom ─────────────────────────────────────────
function ZoomableLightbox({ img, label, onClose }: { img: string; label: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastDist = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 5;
  const ZOOM_STEP = 0.4;

  const clampPos = (x: number, y: number, s: number) => {
    if (s <= 1) return { x: 0, y: 0 };
    const el = containerRef.current;
    if (!el) return { x, y };
    const maxX = (el.clientWidth * (s - 1)) / 2;
    const maxY = (el.clientHeight * (s - 1)) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prev => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev - e.deltaY * 0.005));
      setPos(p => clampPos(p.x, p.y, next));
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPos(p => clampPos(p.x + dx, p.y + dy, scale));
  };
  const handleMouseUp = () => { dragging.current = false; };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1 && scale > 1) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / lastDist.current;
      lastDist.current = dist;
      setScale(prev => {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev * ratio));
        setPos(p => clampPos(p.x, p.y, next));
        return next;
      });
    } else if (e.touches.length === 1 && dragging.current) {
      const dx = e.touches[0].clientX - lastPos.current.x;
      const dy = e.touches[0].clientY - lastPos.current.y;
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPos(p => clampPos(p.x + dx, p.y + dy, scale));
    }
  };
  const handleTouchEnd = () => { dragging.current = false; lastDist.current = null; };

  const zoomIn  = () => setScale(prev => { const next = Math.min(MAX_SCALE, prev + ZOOM_STEP); setPos(p => clampPos(p.x, p.y, next)); return next; });
  const zoomOut = () => setScale(prev => { const next = Math.max(MIN_SCALE, prev - ZOOM_STEP); setPos(p => clampPos(p.x, p.y, next)); return next; });
  const reset   = () => { setScale(1); setPos({ x: 0, y: 0 }); };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ background: "oklch(0.88 0.06 75 / 0.95)" }}
        onClick={e => e.stopPropagation()}
      >
        <span className="font-bold text-sm" style={{ color: "oklch(0.35 0.07 55)", fontFamily: "'Nunito', sans-serif" }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={zoomOut} disabled={scale <= MIN_SCALE}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-opacity disabled:opacity-30 hover:opacity-70"
            style={{ background: "oklch(0.72 0.08 200)", color: "white" }} aria-label="Reduir zoom">−</button>
          <span className="text-xs font-bold w-10 text-center" style={{ color: "oklch(0.35 0.07 55)", fontFamily: "'Nunito', sans-serif" }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} disabled={scale >= MAX_SCALE}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg transition-opacity disabled:opacity-30 hover:opacity-70"
            style={{ background: "oklch(0.72 0.08 200)", color: "white" }} aria-label="Augmentar zoom">+</button>
          {scale !== 1 && (
            <button onClick={reset}
              className="px-2 h-8 rounded-lg text-xs font-bold transition-opacity hover:opacity-70"
              style={{ background: "oklch(0.78 0.07 70)", color: "oklch(0.35 0.07 55)", fontFamily: "'Nunito', sans-serif" }}
              aria-label="Restablir zoom">1:1</button>
          )}
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg hover:opacity-70 transition-opacity ml-1"
            style={{ color: "oklch(0.35 0.07 55)" }} aria-label="Tancar">
            ×
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center"
        style={{ cursor: scale > 1 ? (dragging.current ? "grabbing" : "grab") : "default", touchAction: "none" }}
        onClick={e => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={img}
          alt={label}
          draggable={false}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: dragging.current ? "none" : "transform 0.15s ease",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            userSelect: "none",
          }}
        />
      </div>

      {scale === 1 && (
        <div className="text-center pb-3 text-xs shrink-0" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito', sans-serif" }}>
          Scroll o pinça per fer zoom · Arrossega per desplaçar
        </div>
      )}
    </div>
  );
}

// ── Bloc lema ─────────────────────────────────────────────────
function LemaSection() {
  const [lightbox, setLightbox] = useState<{ img: string; label: string } | null>(null);

  return (
    <>
      <div className="mt-14 mb-4 rounded-3xl overflow-hidden"
        style={{ background: "rgba(0,0,0,0.25)" }}>
        <div className="px-6 pt-8 pb-6 text-center">
          <h3 className="text-white font-black text-2xl sm:text-3xl mb-4 drop-shadow"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            El lema que ho va canviar tot
          </h3>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-6"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            El 19N de 2024, en plena campanya per publicar el conte, el nostre lema era la frase de l'Albert Llimós:
            <em className="block mt-2 text-white font-semibold text-base sm:text-lg">«A tots els abusadors els coneixem, fins avui intocables.»</em>
          </p>
        </div>

        <div className="px-6 py-4">
          <div
            className="relative group cursor-pointer overflow-hidden rounded-2xl"
            onClick={() => setLightbox({ img: LEMA_INTOCABLES, label: 'A tots els abusadors els coneixem, fins avui intocables' })}
          >
            <img
              src={LEMA_INTOCABLES}
              alt="Lema 19N 2024 — Intocables"
              className="w-full object-contain bg-white transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ maxHeight: "350px" }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="text-white text-xs font-semibold text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Il·lustració de Núria Puig
              </p>
            </div>
            <div
              className="absolute inset-0 flex flex-col items-center justify-end pb-8 opacity-0 group-hover:opacity-100 transition-all duration-400"
              style={{ background: "linear-gradient(to top, rgba(30,10,60,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }}
            >
              <span className="text-white text-4xl mb-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">🔍</span>
              <p className="text-white text-xs font-semibold tracking-widest uppercase opacity-90"
                style={{ fontFamily: "'Nunito', sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
                Ampliar
              </p>
            </div>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-400 pointer-events-none rounded-2xl" />
          </div>
        </div>

        <div className="px-6 py-6 text-center">
          <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            Un cop publicat el conte i durant les presentacions, vam adonar-nos del poder que tenim com a comunitat.
            Quan ens sensibilitzem i ens traiem la vena dels ulls, tot canvia.
          </p>
        </div>

        <div className="px-6 py-4">
          <div
            className="relative group cursor-pointer overflow-hidden rounded-2xl"
            onClick={() => setLightbox({ img: LEMA_MONSTRES, label: 'Els monstres tenen por' })}
          >
            <img
              src={LEMA_MONSTRES}
              alt="Lema actual — Els monstres tenen por"
              className="w-full object-contain bg-white transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ maxHeight: "350px" }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="text-white text-xs font-semibold text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Il·lustració de Núria Puig
              </p>
            </div>
            <div
              className="absolute inset-0 flex flex-col items-center justify-end pb-8 opacity-0 group-hover:opacity-100 transition-all duration-400"
              style={{ background: "linear-gradient(to top, rgba(10,40,60,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }}
            >
              <span className="text-white text-4xl mb-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-110">🔍</span>
              <p className="text-white text-xs font-semibold tracking-widest uppercase opacity-90"
                style={{ fontFamily: "'Nunito', sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
                Ampliar
              </p>
            </div>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-400 pointer-events-none rounded-2xl" />
          </div>
        </div>

        <div className="px-6 py-8 text-center">
          <div className="inline-block px-6 py-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.12)" }}>
            <p className="text-white font-black text-lg sm:text-xl italic"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              «Ja no hi ha on amagar-se, els monstres tenen por.»
            </p>
            <p className="text-white/70 text-xs mt-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Aquesta és la nostra fita. Aquest és el lema que volem compartir amb vosaltres.
            </p>
          </div>
        </div>
      </div>

      {lightbox && (
        <ZoomableLightbox
          img={lightbox.img}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

// ── Guia de talles ────────────────────────────────────────────
function SizeGuideSection() {
  const [open, setOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ img: string; label: string } | null>(null);

  return (
    <div className="mt-10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-sm transition-all hover:opacity-90"
        style={{
          background: "oklch(0.88 0.06 75 / 0.9)",
          color: "oklch(0.35 0.07 55)",
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        <span className="flex items-center gap-2">📏 Guia de talles — mesures detallades</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Samarreta Ampla / Infantil", img: IMGS.tallaNoi },
            { label: "Samarreta Entallada", img: IMGS.tallaNoia },
            { label: "Samarreta Tirants", img: IMGS.tallaTirants },
          ].map(item => (
            <div key={item.label}
              className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              style={{ border: "2px solid oklch(0.78 0.07 70 / 0.5)" }}
              onClick={() => setLightbox({ img: item.img, label: item.label })}
            >
              <div className="px-4 py-2 text-center font-bold text-sm flex items-center justify-center gap-1.5"
                style={{ color: "oklch(0.35 0.07 55)", fontFamily: "'Nunito', sans-serif" }}>
                {item.label}
                <span className="text-xs opacity-60">🔍</span>
              </div>
              <img src={item.img} alt={item.label} className="w-full object-contain" />
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <ZoomableLightbox
          img={lightbox.img}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

// ── Pàgina principal ──────────────────────────────────────────
export default function Samarretes() {
  const { openCart, totalItems } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.72 0.08 200)" }}>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-30 backdrop-blur-md"
        style={{ background: "oklch(0.55 0.1 200 / 0.95)", boxShadow: "0 2px 20px rgba(0,0,0,0.15)" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="El Mar dins Meu — Logo far"
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-white font-black text-lg leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                El Mar dins Meu
              </h1>
              <p className="text-white/80 text-xs leading-tight max-w-xs" style={{ fontFamily: "'Nunito', sans-serif", fontSize: "10px" }}>
                Fem visible, l'invisible.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Menú d'administració — visible només per a l'admin */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminMenuOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
                  style={{
                    background: "oklch(0.45 0.1 200 / 0.7)",
                    color: "white",
                    fontFamily: "'Nunito', sans-serif",
                    border: "2px solid rgba(255,255,255,0.25)",
                  }}
                  title="Panell d'administració"
                >
                  <LayoutGrid size={15} />
                  <span className="hidden sm:inline text-xs">Admin</span>
                </button>

                {adminMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAdminMenuOpen(false)}
                    />
                    <div
                      className="absolute right-0 top-full mt-2 z-50 rounded-2xl overflow-hidden shadow-xl"
                      style={{
                        background: "white",
                        border: "2px solid oklch(0.88 0.04 75)",
                        minWidth: "200px",
                      }}
                    >
                      <div
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wide"
                        style={{ color: "oklch(0.6 0.04 55)", fontFamily: "'Nunito', sans-serif", borderBottom: "1px solid oklch(0.92 0.02 75)" }}
                      >
                        Administració
                      </div>
                      <Link href="/admin/comandes" onClick={() => setAdminMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ fontFamily: "'Nunito', sans-serif" }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "oklch(0.72 0.08 200 / 0.15)" }}>
                            <Package size={15} style={{ color: "oklch(0.45 0.1 200)" }} />
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: "oklch(0.3 0.05 55)" }}>Comandes</p>
                            <p className="text-xs" style={{ color: "oklch(0.6 0.04 55)" }}>Gestiona les comandes</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/admin/ressenyes" onClick={() => setAdminMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ fontFamily: "'Nunito', sans-serif", borderTop: "1px solid oklch(0.94 0.02 75)" }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "oklch(0.6 0.15 145 / 0.12)" }}>
                            <Star size={15} style={{ color: "oklch(0.4 0.12 145)" }} />
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: "oklch(0.3 0.05 55)" }}>Ressenyes del llibre</p>
                            <p className="text-xs" style={{ color: "oklch(0.6 0.04 55)" }}>Modera les ressenyes</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/admin/ressenyes-tallers" onClick={() => setAdminMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ fontFamily: "'Nunito', sans-serif", borderTop: "1px solid oklch(0.94 0.02 75)" }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "oklch(0.6 0.15 145 / 0.12)" }}>
                            <Star size={15} style={{ color: "oklch(0.4 0.12 145)" }} />
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: "oklch(0.3 0.05 55)" }}>Ressenyes de tallers</p>
                            <p className="text-xs" style={{ color: "oklch(0.6 0.04 55)" }}>Modera les ressenyes de tallers</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/admin/punts-recollida" onClick={() => setAdminMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ fontFamily: "'Nunito', sans-serif", borderTop: "1px solid oklch(0.94 0.02 75)" }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "oklch(0.72 0.08 200 / 0.15)" }}>
                            <MapPin size={15} style={{ color: "oklch(0.45 0.1 200)" }} />
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: "oklch(0.3 0.05 55)" }}>Punts de recollida</p>
                            <p className="text-xs" style={{ color: "oklch(0.6 0.04 55)" }}>Gestiona els punts de recollida</p>
                          </div>
                        </div>
                      </Link>
                      <Link href="/admin/analitiques" onClick={() => setAdminMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ fontFamily: "'Nunito', sans-serif", borderTop: "1px solid oklch(0.94 0.02 75)" }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "oklch(0.72 0.08 200 / 0.15)" }}>
                            <LayoutGrid size={15} style={{ color: "oklch(0.45 0.1 200)" }} />
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: "oklch(0.3 0.05 55)" }}>Analítiques</p>
                            <p className="text-xs" style={{ color: "oklch(0.6 0.04 55)" }}>Veu les estadístiques de vendes</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Botó cistella */}
            <button onClick={openCart}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
              style={{
                background: "oklch(0.88 0.06 75)",
                color: "oklch(0.35 0.07 55)",
                fontFamily: "'Nunito', sans-serif",
              }}>
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Cistella</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ background: "oklch(0.45 0.1 200)" }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== CATÀLEG SAMARRETES ===== */}
      <main className="container py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 font-bold text-sm"
            style={{ background: "oklch(0.75 0.18 55)", color: "white", fontFamily: "'Nunito', sans-serif" }}>
            ⏳ PRE-COMANDA oberta fins al 30 de maig
          </div>
          <h2 className="text-white font-black text-3xl sm:text-4xl drop-shadow"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Samarretes
          </h2>
          <p className="text-white/90 mt-2 text-base max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            Amb la compra d'una samarreta ens ajudes a difondre el missatge, a sensibilitzar la població i a prevenir l'abús i les violències cap als infants.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={openCart}
              className="px-6 py-3 rounded-xl font-bold text-white"
              style={{ background: "oklch(0.55 0.1 200)", fontFamily: "'Nunito', sans-serif" }}
            >
              Comprar samarreta
            </button>
            <Link href="/">
              <button
                className="px-6 py-3 rounded-xl font-bold"
                style={{ background: "oklch(0.88 0.06 75)", color: "oklch(0.35 0.07 55)", fontFamily: "'Nunito', sans-serif" }}
              >
                Participa
              </button>
            </Link>
          </div>
          <div className="mt-4 inline-flex items-start gap-3 px-5 py-3 rounded-2xl text-sm text-left max-w-xl mx-auto"
            style={{ background: "rgba(255,255,255,0.15)", fontFamily: "'Nunito', sans-serif" }}>
            <span className="text-xl shrink-0">🎨</span>
            <p className="text-white/95 leading-relaxed">
              <strong>Impressió per sublimació:</strong> la tinta s'absorbeix directament al teixit, sense cap capa de plàstic a sobre. El resultat és suau, durador i de qualitat superior. Ha encarit el producte, però creiem que val la pena.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-10">
          {PRODUCTS.map((product, idx) => (
            <ProductCard key={product.id} product={product} delay={idx * 120} />
          ))}
        </div>

        {/* ===== PUNTS DE RECOLLIDA ===== */}
        <div className="mt-16 mb-8 rounded-3xl overflow-hidden" style={{ background: "oklch(0.88 0.06 75 / 0.8)" }}>
          <div className="px-6 py-8 text-center">
            <h3 className="text-2xl sm:text-3xl font-black mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.35 0.07 55)" }}>
              📍 Punts de Recollida
            </h3>
            <p className="text-sm mb-6" style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
              Recull les teves samarretes en un dels nostres punts de confiança. Si ets una entitat, botiga o associació, pots oferir-te com a punt de recollida.
            </p>
            <Link href="/punts-recollida"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all hover:scale-105"
              style={{ background: "oklch(0.72 0.08 200)" }}>
              Veure punts de recollida →
            </Link>
          </div>
        </div>

        <LemaSection />
        <SizeGuideSection />
      </main>

      <CartDrawer />
    </div>
  );
}
