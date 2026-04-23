/* =============================================================
   Home — El Mar dins Meu Botiga
   Disseny: Mediterrània Artesanal (turquesa, beix, polaroid)
   v3: Venda del llibre + estructura associacions + fotos noi millorades
   ============================================================= */

import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { ShoppingBag, Instagram, Mail, ChevronDown, ChevronUp, BookOpen, ExternalLink, Heart, Send, CheckCircle, LayoutGrid, Package, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import ProductCard, { Product } from "@/components/ProductCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { WorkshopReviewForm } from "@/components/WorkshopReviewForm";
import { WorkshopReviewsCarousel } from "@/components/WorkshopReviewsCarousel";

// ── CDN URLs ──────────────────────────────────────────────────
const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS";

const IMGS = {
  hero:            `${CDN}/presentacio_event_eeba158e.jpg`,
  heroAlt:         `${CDN}/familia_llibre_0e9c67f8.jpg`,
  noiTemplate:     `${CDN}/samarreta_noi_template_36ef8150.png`,
  noiInterior:     "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/samarreta_noi_interior_nova_e1a4f154.png",
  noiExterior:     "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/samarreta_noi_exterior_nova_3890a708.png",
  noia:            `${CDN}/samarreta_noia_real_0a3b22c7.jpg`,
  noiaExterior:    `${CDN}/noia_exterior_28cca105.jpg`,
  samarretesTotes: `${CDN}/samarretes_totes_814e4139.jpg`,
  tirantsFrontal:  `${CDN}/tirants_frontal_749e359c.jpg`,
  tirantsEsquena:  `${CDN}/tirants_esquena_nova_0aa85d8d.jpg`,
  tirantsEsquena2: `${CDN}/tirants_esquena2_9c12192b.jpg`,
  tirantsLateral:  `${CDN}/tirants_lateral_7e569621.jpg`,
  infantil1:       `${CDN}/infantil_nena_nova_ac666b14.jpg`,
  infantil2:       `${CDN}/infantil_nena2_6f81c493.jpg`,
  llibre:          "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/llibre_flors_final_1bd21f49.jpeg",
  presentacio:     `${CDN}/presentacio_event_eeba158e.jpg`,
  familia:         `${CDN}/familia_llibre_0e9c67f8.jpg`,
  tallaNoi:        `${CDN}/taula_talles_noi_056863df.jpg`,
  tallaNoia:       `${CDN}/taula_talles_noia_2980b7fb.jpg`,
  tallaTirants:    `${CDN}/taula_talles_tirants_5490a192.jpg`,
  llop:            `${CDN}/ilustracio_llop_395300cb.jpg`,
};

// ── Catàleg de productes ──────────────────────────────────────
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

// Plataformes de venda del llibre
const BOOK_PLATFORMS = [
  { name: "El Cep i la Nansa", url: "https://elcepilanansa.com/producte/el-mar-dins-meu/" },
  { name: "Casa del Libro", url: "https://www.casadellibro.com/libro-el-mar-dins-meu/9788419552389/14060023" },
  { name: "La Central", url: "https://www.lacentral.com" },
  { name: "Abacus", url: "https://www.abacus.coop" },
  { name: "Agapea", url: "https://www.agapea.com" },
  { name: "Amazon", url: "https://www.amazon.es" },
];

// ── Constants de lema ───────────────────────────────────────
const LEMA_INTOCABLES = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/lema_intocables_d670505c.jpg";
const LEMA_MONSTRES = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/lema_monstres_por_hq_58967abc.jpg";

// ── Bloc narratiu del lema ────────────────────────────────────
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

        {/* Imatge 1 — Intocables */}
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
            {/* Crèdit de Núria Puig */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="text-white text-xs font-semibold text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Il·lustració de Núria Puig
              </p>
            </div>
            {/* Overlay gradient + icona + text */}
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
            {/* Vora lluminosa */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-400 pointer-events-none rounded-2xl" />
          </div>
        </div>

        {/* Text central */}
        <div className="px-6 py-6 text-center">
          <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            Un cop publicat el conte i durant les presentacions, vam adonar-nos del poder que tenim com a comunitat.
            Quan ens sensibilitzem i ens traiem la vena dels ulls, tot canvia.
          </p>
        </div>

        {/* Imatge 2 — Els monstres tenen por */}
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
            {/* Crèdit de Núria Puig */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="text-white text-xs font-semibold text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Il·lustració de Núria Puig
              </p>
            </div>
            {/* Overlay gradient + icona + text */}
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
            {/* Vora lluminosa */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-400 pointer-events-none rounded-2xl" />
          </div>
        </div>

        {/* Quadre final */}
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

// ── Component guia de talles ──────────────────────────────────
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

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(prev => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev - e.deltaY * 0.005));
      setPos(p => clampPos(p.x, p.y, next));
      return next;
    });
  };

  // Mouse drag
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

  // Touch pinch + drag
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

  const zoomIn = () => setScale(prev => { const next = Math.min(MAX_SCALE, prev + ZOOM_STEP); setPos(p => clampPos(p.x, p.y, next)); return next; });
  const zoomOut = () => setScale(prev => { const next = Math.max(MIN_SCALE, prev - ZOOM_STEP); setPos(p => clampPos(p.x, p.y, next)); return next; });
  const reset = () => { setScale(1); setPos({ x: 0, y: 0 }); };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      {/* Capçalera */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ background: "oklch(0.88 0.06 75 / 0.95)" }}
        onClick={e => e.stopPropagation()}
      >
        <span className="font-bold text-sm" style={{ color: "oklch(0.35 0.07 55)", fontFamily: "'Nunito', sans-serif" }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {/* Botons zoom */}
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

      {/* Àrea de la imatge */}
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

      {/* Hint */}
      {scale === 1 && (
        <div className="text-center pb-3 text-xs shrink-0" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Nunito', sans-serif" }}>
          Scroll o pinça per fer zoom · Arrossega per desplaçar
        </div>
      )}
    </div>
  );
}

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

// ── Secció del llibre ─────────────────────────────────────────
const BOOK_CAROUSEL_IMGS = [
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/llibre_flors_nou_6e7a0158.jpeg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/llibre_acte_samarretes_9f69c700.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/llibre_tres_noies_d75ac527.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/llibre_barnahus_3dfb46fc.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car01_2076cf44.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car02_b19a210d.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car03_b1151cf0.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car04_328a5d05.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car05_45aef0ac.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car06_8b712125.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car07_cf9d946b.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car08_4fd7f9a7.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car09_9b7ae81d.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car10_10b60a5d.jpg",
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car11_6e0e522e.jpg",
];
const BOOK_TITLE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/llibre_ilustracio_portada_0c57fc21.jpg";

// ── Carrusel del projecte en acció ──────────────────────────
// Cada entrada: { src, objectPosition } per controlar el retall de cada foto
const PROJECT_CAROUSEL_IMGS: { src: string; pos: string }[] = [
  // Foto de les 5 persones amb samarretes — object-top per no tallar els caps
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/llibre_acte_samarretes_9f69c700.jpg", pos: "center top" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/llibre_tres_noies_d75ac527.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/llibre_barnahus_3dfb46fc.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car01_2076cf44.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car02_b19a210d.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car03_b1151cf0.jpg", pos: "center top" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car04_328a5d05.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car05_45aef0ac.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car06_8b712125.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car07_cf9d946b.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car08_4fd7f9a7.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car09_9b7ae81d.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car10_10b60a5d.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car11_6e0e522e.jpg", pos: "center center" },
  // Fotos noves
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car_ana_nieto_4bcb3c59.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car_llibreria_prestatge_cc23a859.jpg", pos: "center 60%" },  // llibre centrat
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car_narrativa_terapeutica_79ba1a71.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car_barques_paper_362d1cf6.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car_alt_penedes_de03cd1f.jpg", pos: "center center" },
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car_setmana_llibre_d94bb077.jpg", pos: "center bottom" },  // cares visibles (part inferior)
  { src: "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/car_familia_llibre2_1b11c29b.jpg", pos: "center 30%" },  // cares i llibre visibles
];

function ProjectCarousel() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(prev => (prev + 1) % PROJECT_CAROUSEL_IMGS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl max-w-3xl mx-auto" style={{ aspectRatio: "16/9" }}>
      {PROJECT_CAROUSEL_IMGS.map((item, i) => (
        <img
          key={i}
          src={item.src}
          alt={`El projecte en acció — foto ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: idx === i ? 1 : 0, objectPosition: item.pos }}
        />
      ))}
      {/* Indicadors */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {PROJECT_CAROUSEL_IMGS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: idx === i ? "white" : "rgba(255,255,255,0.45)",
              transform: idx === i ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function BookSection() {
  return (
    <section className="py-14" style={{ background: "oklch(0.96 0.03 75)" }}>
      <div className="container">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

          {/* Imatge estàtica del llibre amb flors */}
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src={IMGS.llibre}
              alt="El Mar dins Meu — llibre amb flors"
              className="w-full h-full object-cover object-center"
              style={{ aspectRatio: "1/1" }}
            />
          </div>

          {/* Info del llibre */}
          <div>
            <div className="mb-4">
              <p className="text-sm mb-1"
                style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                <strong>Autora:</strong> Montse Marquès
              </p>
              <p className="text-sm mb-3"
                style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                <strong>Il·lustracions:</strong> Núria Puig · <strong>Editorial:</strong> Kairat
              </p>
              {/* Preu */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl mb-4"
                style={{ background: "oklch(0.72 0.08 200)", color: "white" }}>
                <BookOpen size={20} />
                <span className="font-black text-2xl">16€</span>
              </div>
            </div>

            {/* Plataformes de venda */}
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-wide mb-3"
                style={{ color: "oklch(0.4 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                On comprar-lo:
              </p>
              <div className="flex flex-wrap gap-2">
                {BOOK_PLATFORMS.map(p => (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{
                      background: "white",
                      color: "oklch(0.45 0.1 200)",
                      border: "2px solid oklch(0.72 0.08 200 / 0.4)",
                      fontFamily: "'Nunito', sans-serif",
                    }}>
                    {p.name}
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
              <p className="text-xs mt-3 italic"
                style={{ color: "oklch(0.55 0.04 55)", fontFamily: "'Nunito', sans-serif" }}>
                📚 També pots demanar-lo a la teva llibreria de confiança
              </p>

              {/* Botó compartir a WhatsApp */}
              <button
                onClick={() => {
                  const url = "https://elmarshop-nnesjwsk.manus.space";
                  const text = `Descobreix "El Mar dins Meu", el llibre de la Montse Marquès il·lustrat per Núria Puig. Una obra valenta i necessària! 📖💜 ${url} #ElMardinsMeu`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
                }}
                className="mt-4 w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "#25D366",
                  color: "white",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Comparteix el llibre a WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Secció L'eco del silenci ────────────────────────────────
function EcoDelSilenciSection() {
  return (
    <section className="py-14" style={{ background: "oklch(0.72 0.08 200)" }}>
      <div className="container">
        {/* Títol */}
        <div className="text-center mb-10">
          <h2 className="font-black text-4xl sm:text-5xl mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: "white" }}>
            L'eco del silenci
          </h2>
          <p className="text-white/90 font-bold text-lg italic"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            De la ferida a la força
          </p>
        </div>

        {/* Estadístiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="rounded-3xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}>
            <p className="text-5xl font-black mb-2" style={{ color: "white" }}>
              1 de cada 5
            </p>
            <p className="text-white/90 font-semibold text-sm"
              style={{ fontFamily: "'Nunito', sans-serif" }}>
              infants a Catalunya patirà abusos sexuals durant la infància
            </p>
          </div>
          <div className="rounded-3xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}>
            <p className="text-5xl font-black mb-2" style={{ color: "white" }}>
              60%
            </p>
            <p className="text-white/90 font-semibold text-sm"
              style={{ fontFamily: "'Nunito', sans-serif" }}>
              de les víctimes no demanarà ajuda mai.<br />
              <span className="text-xs text-white/70">No perquè no ho necessitin...</span>
            </p>
          </div>
        </div>

        {/* Text principal */}
        <div className="rounded-3xl p-8 mb-10"
          style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)" }}>
          <p className="text-white/95 font-semibold text-base leading-relaxed mb-4"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            Durant massa temps, la societat ha preferit no mirar, no preguntar, no parlar-ne. Però aquest silenci té conseqüències: <span className="font-black">protegeix els agressors i deixa les víctimes soles.</span>
          </p>
          <p className="text-white/95 font-semibold text-base leading-relaxed"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            Davant d'aquesta realitat neix <span className="font-black">L'eco del silenci</span>, un projecte que vol trencar el tabú dels abusos sexuals infantils i convertir la comunitat en part de la solució.
          </p>
        </div>

        {/* Descripció del projecte */}
        <div className="rounded-3xl p-8 mb-10"
          style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.15)" }}>
          <p className="text-white/90 text-base leading-relaxed mb-4"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            El projecte neix a partir del conte <span className="font-bold italic">El mar dins meu</span>, una història autobiogràfica que busca posar paraules a allò que durant massa anys ha estat callat. Un relat per obrir espais d'escolta, despertar empatia i recordar que els abusos sexuals infantils no són una exageració ni una ficció: <span className="font-black">són una realitat que conviu entre nosaltres.</span>
          </p>
        </div>

        {/* Cita Albert Llimós */}
        <div className="rounded-3xl p-8 mb-10 border-l-4"
          style={{ background: "rgba(255,255,255,0.08)", borderLeftColor: "white" }}>
          <p className="text-white/95 italic text-base leading-relaxed mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            "Els monstres d'avui no són ni llops famolencs, ni tampoc homes tèrbols en gavardina… El mar dins meu és un conte que ens mostra la necessitat de trencar silencis, i també d'expulsar la culpa d'aquells que han caigut a les urpes d'aquests monstres."
          </p>
          <p className="text-white/70 text-sm font-semibold"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            — Albert Llimós, periodista d'investigació
          </p>
        </div>

        {/* Pilars del projecte */}
        <div className="rounded-3xl p-8 mb-10"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          <p className="text-white font-black text-lg mb-6"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            A partir d'aquesta història, L'eco del silenci impulsa:
          </p>
          <ul className="space-y-3">
            {[
              "Guies informatives per a famílies i comunitat educativa",
              "Xerrades i espais de reflexió als municipis",
              "Difusió i sensibilització a xarxes socials",
              "Testimonis reals que ajuden altres víctimes a trencar el silenci",
              "Canals segurs perquè qui necessiti ajuda la pugui demanar sense por"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-white/90"
                style={{ fontFamily: "'Nunito', sans-serif" }}>
                <span className="text-xl mt-1" style={{ color: "white" }}>●</span>
                <span className="font-semibold">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cita final */}
        <div className="text-center">
          <p className="text-white font-black text-2xl sm:text-3xl italic"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            "TRENCAR EL SILENCI ÉS LA NOSTRA RESPONSABILITAT."
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Secció ressenyes ─────────────────────────────────────────


function ReviewsSection() {
  const { data: reviews = [], isLoading } = trpc.reviews.listApproved.useQuery();
  const [activeIdx, setActiveIdx] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ authorName: "", location: "", rating: 5, content: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const submitMutation = trpc.reviews.submit.useMutation({
    onSuccess: () => {
      toast.success("Gràcies per la teva ressenya! Serà publicada un cop revisada.");
      setForm({ authorName: "", location: "", rating: 5, content: "" });
      setShowForm(false);
    },
    onError: () => toast.error("Hi ha hagut un error. Torna-ho a intentar."),
  });

  useEffect(() => {
    if (reviews.length === 0) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  function validateForm() {
    const e: Record<string, string> = {};
    if (!form.authorName.trim() || form.authorName.length < 2) e.authorName = "El nom és obligatori (mínim 2 caràcters)";
    if (!form.content.trim() || form.content.length < 10) e.content = "La ressenya ha de tenir almenys 10 caràcters";
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    submitMutation.mutate({
      authorName: form.authorName,
      location: form.location || undefined,
      rating: form.rating,
      content: form.content,
    });
  }

  const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors";
  const inputStyle = { fontFamily: "'Nunito', sans-serif", border: "2px solid oklch(0.88 0.06 75)", background: "white", color: "oklch(0.3 0.06 50)" };

  return (
    <section className="py-14" style={{ background: "oklch(0.98 0.01 200)" }}>
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-black text-3xl sm:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
            QUÈ DIU QUI L'HA LLEGIT
          </h2>
          {reviews.length > 0 && (
            <>
              <div className="flex justify-center gap-1 mt-3">
                {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-xl">★</span>)}
              </div>
              <p className="mt-2 text-sm font-semibold"
                style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                {reviews.length} {reviews.length === 1 ? "ressenya" : "ressenyes"}
              </p>
            </>
          )}
        </div>

        {/* Carrusel de ressenyes aprovades */}
        {isLoading ? (
          <div className="text-center py-8" style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>Carregant ressenyes...</div>
        ) : reviews.length > 0 ? (
          <div className="relative max-w-2xl mx-auto mb-10">
            <div className="overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeIdx * 100}%)` }}
              >
                {reviews.map((r, i) => (
                  <div key={r.id} className="min-w-full px-2">
                    <div className="rounded-3xl p-8 shadow-lg relative"
                      style={{ background: "white", border: "2px solid oklch(0.72 0.08 200 / 0.2)" }}>
                      <span className="absolute top-5 left-6 text-6xl leading-none"
                        style={{ color: "oklch(0.72 0.08 200 / 0.15)", fontFamily: "Georgia, serif" }}>&ldquo;</span>
                      <div className="flex gap-0.5 mb-4">
                        {Array.from({ length: r.rating }).map((_, s) => <span key={s} className="text-yellow-400 text-lg">★</span>)}
                      </div>
                      <p className="text-base leading-relaxed mb-6 relative z-10"
                        style={{ color: "oklch(0.35 0.04 55)", fontFamily: "'Nunito', sans-serif" }}>
                        &ldquo;{r.content}&rdquo;
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-black text-sm" style={{ color: "oklch(0.3 0.06 50)", fontFamily: "'Playfair Display', serif" }}>{r.authorName}</p>
                          {r.location && <p className="text-xs" style={{ color: "oklch(0.6 0.04 55)", fontFamily: "'Nunito', sans-serif" }}>{r.location}</p>}
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg"
                          style={{ background: "oklch(0.72 0.08 200)" }}>
                          {r.authorName[0]?.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {reviews.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {reviews.map((_, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)}
                    className="rounded-full transition-all duration-300"
                    style={{ width: activeIdx === i ? "24px" : "8px", height: "8px",
                      background: activeIdx === i ? "oklch(0.72 0.08 200)" : "oklch(0.72 0.08 200 / 0.3)" }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 max-w-md mx-auto">
            <p className="text-base mb-2" style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
              Sigues el primer en deixar la teva ressenya!
            </p>
          </div>
        )}

        {/* Botó per obrir el formulari */}
        {!showForm && (
          <div className="text-center mt-4">
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105"
              style={{ background: "oklch(0.72 0.08 200)", color: "white", fontFamily: "'Nunito', sans-serif",
                boxShadow: "0 4px 16px oklch(0.72 0.08 200 / 0.3)" }}>
              ✍️ Deixa la teva ressenya
            </button>
          </div>
        )}

        {/* Formulari d'enviament */}
        {showForm && (
          <div className="max-w-xl mx-auto mt-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ border: "2px solid oklch(0.88 0.06 75)" }}>
              <h3 className="font-black text-xl mb-6 text-center"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
                Comparteix la teva experiència
              </h3>
              <p className="text-xs text-center mb-6" style={{ color: "oklch(0.6 0.04 55)", fontFamily: "'Nunito', sans-serif" }}>
                La teva ressenya serà revisada abans de ser publicada.
              </p>
              <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>Nom *</label>
                    <input value={form.authorName} onChange={e => setForm(p => ({ ...p, authorName: e.target.value }))}
                      placeholder="El teu nom" className={inputCls}
                      style={{ ...inputStyle, borderColor: formErrors.authorName ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)" }} />
                    {formErrors.authorName && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.2 30)" }}>{formErrors.authorName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>Localitat (opcional)</label>
                    <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                      placeholder="Barcelona, Girona..." className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold mb-2" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>Valoració *</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: s }))}
                        className="text-2xl transition-transform hover:scale-110"
                        style={{ color: s <= form.rating ? "#f59e0b" : "oklch(0.85 0.02 55)" }}>★</button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold mb-1" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>Ressenya *</label>
                  <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    rows={4} placeholder="Explica la teva experiència amb el llibre o el projecte..."
                    className={inputCls} style={{ ...inputStyle, resize: "vertical" as const,
                      borderColor: formErrors.content ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)" }} />
                  {formErrors.content && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.2 30)" }}>{formErrors.content}</p>}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                    style={{ background: "oklch(0.92 0.02 55)", color: "oklch(0.4 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                    Cancel·lar
                  </button>
                  <button type="submit" disabled={submitMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02] disabled:opacity-70"
                    style={{ background: "oklch(0.55 0.1 200)", color: "white", fontFamily: "'Nunito', sans-serif" }}>
                    {submitMutation.isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviant...</> : "Enviar ressenya"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Secció associacions ──────────────────────────────────────
const LOGO_LALO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/logo_lalo_nou_c84a9f64.png";
const BANNER_LALO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/banner_lalo_morat_9842f0e3.png";
const LOGO_ANGEL_BLAU = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/logo_angel_blau_09201c16.webp";

function AssociationsSection() {
  const ASSOCIATIONS = [
    {
      name: "Associació LaLo",
      desc: "Visibilitzar, conscienciar, prevenir i acompanyar la violència sexual en la infància i les seves greus conseqüències.",
      logo: LOGO_LALO,
      banner: BANNER_LALO,
      url: "https://laloassociacio.org",
      logoStyle: { maxHeight: "80px", objectFit: "contain" as const },
      bgColor: "oklch(0.88 0.06 300 / 0.3)",
    },
    {
      name: "Àngel Blau",
      desc: "Prevenció de l'abús sexual infantil, acompanyament a víctimes i famílies, pionera a Catalunya.",
      logo: LOGO_ANGEL_BLAU,
      url: "https://angelblau.com",
      logoStyle: { maxHeight: "50px", objectFit: "contain" as const },
      bgColor: "oklch(0.96 0.03 200)",
    },
  ];

  return (
    <section className="py-14" style={{ background: "oklch(0.98 0.01 75)" }}>
      <div className="container">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart size={20} style={{ color: "oklch(0.55 0.15 30)" }} />
            <h2 className="font-black text-2xl sm:text-3xl"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
              Cooperem amb
            </h2>
          </div>
          <p className="text-sm max-w-xl mx-auto"
            style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
            Entitats amb qui treballem per la prevenció i l'acompanyament en casos d'abusos sexuals infantils.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {ASSOCIATIONS.map((assoc: any, idx: number) => (
            <a key={idx} href={assoc.url} target="_blank" rel="noopener noreferrer"
              className="block rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ border: "2px solid oklch(0.9 0.03 75)" }}>
              {/* Header: banner o color de fons amb logo */}
              {assoc.banner ? (
                <div className="relative" style={{ minHeight: "100px" }}>
                  <img src={assoc.banner} alt={`${assoc.name} banner`} className="w-full object-cover" style={{ maxHeight: "100px" }} />
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.15)" }}>
                    <img src={assoc.logo} alt={assoc.name} style={assoc.logoStyle} className="max-w-full drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center px-6 py-5" style={{ background: assoc.bgColor, minHeight: "80px" }}>
                  <img src={assoc.logo!} alt={assoc.name} style={assoc.logoStyle} className="max-w-full" />
                </div>
              )}
              {/* Info */}
              <div className="bg-white px-6 py-5">
                <h3 className="font-bold text-base mb-2"
                  style={{ color: "oklch(0.3 0.06 50)", fontFamily: "'Playfair Display', serif" }}>
                  {assoc.name}
                </h3>
                <p className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                  {assoc.desc}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "oklch(0.45 0.1 200)" }}>
                  <ExternalLink size={11} />
                  <span>Visita el seu web</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Formulari de contacte integrat ──────────────────────────
function ContactSection() {
  const [form, setForm] = useState({ nom: "", email: "", motiu: "", missatge: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const MOTIUS = [
    "Informació sobre el projecte",
    "Col·laboració o associació",
    "Presentació o activitat",
    "Premsa i comunicació",
    "Altres consultes",
  ];

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nom.trim()) e.nom = "El nom és obligatori";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Introdueix un correu vàlid";
    if (!form.motiu) e.motiu = "Selecciona el motiu";
    if (form.missatge.trim().length < 10) e.missatge = "El missatge ha de tenir almenys 10 caràcters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }

  const sendContact = trpc.contact.send.useMutation({
    onSuccess: () => {
      setSending(false);
      setSent(true);
    },
    onError: (err) => {
      setSending(false);
      toast.error(err.message || "No s'ha pogut enviar el missatge. Intenta-ho de nou.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    sendContact.mutate({
      nom: form.nom,
      email: form.email,
      motiu: form.motiu,
      missatge: form.missatge,
    });
  }

  const inputCls = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors";
  const inputStyle = { fontFamily: "'Nunito', sans-serif", border: "2px solid oklch(0.88 0.06 75)", background: "white", color: "oklch(0.3 0.06 50)" };

  return (
    <section className="py-16 px-4" style={{ background: "oklch(0.96 0.03 80)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
            style={{ background: "oklch(0.72 0.08 200 / 0.15)", border: "2px solid oklch(0.72 0.08 200 / 0.3)" }}>
            <Mail size={24} style={{ color: "oklch(0.45 0.1 200)" }} />
          </div>
          <h2 className="font-black text-3xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
            Contacta amb nosaltres
          </h2>
          <p className="text-base" style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
            Tens alguna pregunta sobre el projecte, vols col·laborar o organitzar una activitat?
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ border: "3px solid oklch(0.88 0.06 75)" }}>
          {sent ? (
            <div className="text-center py-10">
              {/* Icòna animada de confirmació */}
              <div className="flex items-center justify-center mb-5">
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.92 0.06 200)" }}>
                  <CheckCircle size={44} style={{ color: "oklch(0.45 0.12 200)" }} />
                </div>
              </div>

              <h3 className="font-black text-2xl mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
                Missatge enviat!
              </h3>
              <p className="text-base mb-6"
                style={{ color: "oklch(0.45 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                Gràcies, <strong>{form.nom.split(" ")[0]}</strong>. Hem rebut el teu missatge i ens posarem en contacte amb tu ben aviat.
              </p>

              {/* Resum del missatge enviat */}
              <div className="rounded-2xl px-6 py-4 mb-6 text-left"
                style={{ background: "oklch(0.96 0.03 200)", border: "2px solid oklch(0.72 0.08 200 / 0.25)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Send size={14} style={{ color: "oklch(0.55 0.1 200)" }} />
                  <span className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: "oklch(0.45 0.1 200)", fontFamily: "'Nunito', sans-serif" }}>
                    Resum del missatge
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm"
                  style={{ color: "oklch(0.4 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
                  <div>
                    <span className="text-xs text-gray-400">Correu</span>
                    <p className="font-semibold truncate">{form.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Motiu</span>
                    <p className="font-semibold">{form.motiu}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setForm({ nom: "", email: "", motiu: "", missatge: "" }); setSent(false); }}
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 hover:opacity-90"
                style={{ background: "oklch(0.72 0.08 200)", color: "white", fontFamily: "'Nunito', sans-serif" }}>
                Enviar una altra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>Nom i cognoms *</label>
                  <input name="nom" type="text" value={form.nom} onChange={handleChange} placeholder="El teu nom" className={inputCls} style={{ ...inputStyle, borderColor: errors.nom ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)" }} />
                  {errors.nom && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.2 30)", fontFamily: "'Nunito', sans-serif" }}>{errors.nom}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>Correu electrònic *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correu@exemple.cat" className={inputCls} style={{ ...inputStyle, borderColor: errors.email ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)" }} />
                  {errors.email && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.2 30)", fontFamily: "'Nunito', sans-serif" }}>{errors.email}</p>}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold mb-1" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>Motiu de la consulta *</label>
                <select name="motiu" value={form.motiu} onChange={handleChange} className={inputCls} style={{ ...inputStyle, borderColor: errors.motiu ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)", appearance: "none" as const }}>
                  <option value="">Selecciona el motiu...</option>
                  {MOTIUS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.motiu && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.2 30)", fontFamily: "'Nunito', sans-serif" }}>{errors.motiu}</p>}
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold mb-1" style={{ color: "oklch(0.4 0.06 55)", fontFamily: "'Nunito', sans-serif" }}>Missatge *</label>
                <textarea name="missatge" value={form.missatge} onChange={handleChange} rows={5} placeholder="Explica'ns la teva consulta..." className={inputCls} style={{ ...inputStyle, resize: "vertical" as const, borderColor: errors.missatge ? "oklch(0.55 0.2 30)" : "oklch(0.88 0.06 75)" }} />
                {errors.missatge && <p className="text-xs mt-1" style={{ color: "oklch(0.55 0.2 30)", fontFamily: "'Nunito', sans-serif" }}>{errors.missatge}</p>}
              </div>
              <button type="submit" disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-base transition-all hover:scale-[1.02] disabled:opacity-70"
                style={{ background: "oklch(0.55 0.1 200)", color: "white", fontFamily: "'Nunito', sans-serif", boxShadow: "0 4px 20px oklch(0.55 0.1 200 / 0.35)" }}>
                {sending ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Preparant...</> : <><Send size={18} />Enviar consulta</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// // ── Component de copiar enllaç amb tooltip ────────────────────────────────
function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 4000); // 4 segons
    });
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleCopy}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110"
        style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
        title="Copiar enllaç"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </button>
      {copied && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg text-white text-xs font-semibold whitespace-nowrap pointer-events-none"
          style={{ background: "rgba(0,0,0,0.8)", animation: "fadeInOut 4s ease-in-out" }}
        >
          Enllaç copiat!
          {/* Punta del tooltip */}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: "rgba(0,0,0,0.8)" }}
          />
        </div>
      )}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Pàgina principal ──────────────────────────────────────
export default function Home() {
  const { totalItems, openCart } = useCart();
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
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/logoELMARDINSMEU_5d9b7206.png"
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
            {/* Botó d'inici de sessió — visible només si no estàs autenticat */}
            {!user && (
              <button
                onClick={() => { window.location.href = "/login"; }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
                style={{
                  background: "oklch(0.45 0.1 200 / 0.7)",
                  color: "white",
                  fontFamily: "'Nunito', sans-serif",
                  border: "2px solid rgba(255,255,255,0.25)",
                }}
              >
                <span className="text-xs">Accedir</span>
              </button>
            )}

            {/* Link a l'historial de comandes — visible per a usuaris autenticats */}
            {user && !isAdmin && (
              <Link href="/comandes">
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
                  style={{
                    background: "oklch(0.45 0.1 200 / 0.7)",
                    color: "white",
                    fontFamily: "'Nunito', sans-serif",
                    border: "2px solid rgba(255,255,255,0.25)",
                  }}
                  title="Les meves comandes"
                >
                  <Package size={15} />
                  <span className="hidden sm:inline text-xs">Comandes</span>
                </button>
              </Link>
            )}

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
                    {/* Overlay per tancar el menú */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setAdminMenuOpen(false)}
                    />
                    {/* Desplegable */}
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
                        <div
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
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
                        <div
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ fontFamily: "'Nunito', sans-serif", borderTop: "1px solid oklch(0.94 0.02 75)" }}
                        >
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
                        <div
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ fontFamily: "'Nunito', sans-serif", borderTop: "1px solid oklch(0.94 0.02 75)" }}
                        >
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
                      <Link href="/admin/analitiques" onClick={() => setAdminMenuOpen(false)}>
                        <div
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          style={{ fontFamily: "'Nunito', sans-serif", borderTop: "1px solid oklch(0.94 0.02 75)" }}
                        >
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

      {/* ===== HERO — Il·lustració portada ===== */}
      <section className="w-full" style={{ background: "oklch(0.97 0.01 55)" }}>
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/portada_illustracio_668c66a4.png"
          alt="El mar dins meu — Montse Marquès, il·lustrat per Núria Puig"
          className="w-full"
          style={{ display: "block", width: "100%", height: "auto", maxHeight: "480px", objectFit: "contain", objectPosition: "center" }}
        />
      </section>

      {/* ===== EL LLIBRE ===== */}
      <BookSection />
      <ReviewsSection />
      <EcoDelSilenciSection />
      
      {/* ===== RESSENYES DE TALLERS I XERRADES ===== */}
      <section className="py-14" style={{ background: "oklch(0.96 0.03 75)" }}>
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="font-black text-3xl sm:text-4xl mb-2"
              style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
              Experiencies dels tallers i xerrades
            </h2>
            <p className="text-sm font-semibold mt-2"
              style={{ color: "oklch(0.5 0.05 55)", fontFamily: "'Nunito', sans-serif" }}>
              Comparteix la teva experiencia als nostres events
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-10">
            <WorkshopReviewsCarousel />
            <WorkshopReviewForm />
          </div>
        </div>
      </section>

      {/* ===== CATÀLEG SAMARRETES ===== */}
      <main className="container py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 font-bold text-sm"
            style={{ background: "oklch(0.75 0.18 55)", color: "white", fontFamily: "'Nunito', sans-serif" }}>
            ⏳ PREVENTA — Recollida a partir de Maig 2026
          </div>
          <h2 className="text-white font-black text-3xl sm:text-4xl drop-shadow"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Samarretes
          </h2>
          <p className="text-white/90 mt-2 text-base max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            Amb la compra d'una samarreta ens ajudes a difondre el missatge, a sensibilitzar la població i a prevenir l'abús i les violències cap als infants.
          </p>
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

        {/* Guia de talles desplegable */}
        {/* ===== BLOC LEMA ===== */}
        <LemaSection />

        <SizeGuideSection />
      </main>

      {/* ===== EL PROJECTE ===== */}
      <section className="py-14" style={{ background: "oklch(0.65 0.09 200 / 0.6)" }}>
        <div className="container">
          {/* Frase CTA */}
          <div className="border-t border-white/20 pt-4 text-center">
            <p className="font-black text-xl text-white"
              style={{ fontFamily: "'Caveat', cursive", fontSize: "24px" }}>
              "TRENCAR EL SILENCI ÉS LA NOSTRA RESPONSABILITAT."
            </p>
          </div>

          {/* Carrusel del projecte en acció */}
          <h3 className="text-white font-bold text-xl text-center mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            El projecte en acció
          </h3>
          <ProjectCarousel />
        </div>
      </section>

      {/* ===== BENEFICIS ===== */}
      <section className="py-10" style={{ background: "oklch(0.62 0.09 200 / 0.5)" }}>
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-white font-black text-xl sm:text-2xl leading-relaxed"
              style={{ fontFamily: "'Caveat', cursive", fontSize: "26px" }}>
              Els beneficis del projecte van destinats a fer arribar aquest missatge a més persones.
            </p>
            <p className="text-white/75 text-sm mt-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Cada samarreta que compres contribueix directament a la sensibilització i a la prevenció dels abusos sexuals infantils.
            </p>
          </div>
        </div>
      </section>

      {/* ===== ASSOCIACIONS ===== */}
      <AssociationsSection />

      {/* ===== COM FER UN ENCÀRREC ===== */}
      <section className="py-12" style={{ background: "oklch(0.55 0.1 200)" }}>
        <div className="container">
          <h2 className="text-white font-black text-2xl sm:text-3xl text-center mb-8"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Com fer un encàrrec
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: "1", title: "Tria la samarreta", desc: "Selecciona el model i la talla que vols del catàleg" },
              { num: "2", title: "Afegeix a la cistella", desc: "Pots afegir diversos productes i revisar el total" },
              { num: "3", title: "Envia la comanda", desc: "Omple les dades i tria la forma de pagament. T'enviarem la confirmació!" },
            ].map(step => (
              <div key={step.num} className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl"
                  style={{
                    background: "oklch(0.88 0.06 75)",
                    color: "oklch(0.35 0.07 55)",
                    fontFamily: "'Playfair Display', serif",
                  }}>
                  {step.num}
                </div>
                <h3 className="text-white font-bold text-lg mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  {step.title}
                </h3>
                <p className="text-white/80 text-sm"
                  style={{ fontFamily: "'Nunito', sans-serif" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PAGAMENT ===== */}
      <section className="py-10" style={{ background: "oklch(0.88 0.06 75)" }}>
        <div className="container text-center">
          <h2 className="font-black text-2xl mb-6"
            style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>
            Formes de pagament
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-sm"
              style={{ border: "2px solid oklch(0.78 0.07 70)" }}>
              <span className="text-2xl">🏦</span>
              <div>
                <span className="font-bold text-sm block"
                  style={{ color: "oklch(0.35 0.07 55)", fontFamily: "'Nunito', sans-serif" }}>
                  Transferència bancària
                </span>
                <span className="text-xs"
                  style={{ color: "oklch(0.55 0.04 55)", fontFamily: "'Nunito', sans-serif" }}>
                  Dades facilitades en confirmar la comanda
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-sm"
              style={{ border: "2px solid oklch(0.78 0.07 70)" }}>
              <span className="text-2xl">🤝</span>
              <span className="font-bold text-sm"
                style={{ color: "oklch(0.35 0.07 55)", fontFamily: "'Nunito', sans-serif" }}>
                Pagament en mà
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FORMULARI DE CONTACTE ===== */}
      <ContactSection />

      {/* ===== FOOTER ===== */}
      <footer className="py-8" style={{ background: "oklch(0.35 0.07 200)" }}>
        <div className="container text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS/logoELMARDINSMEU_5d9b7206.png"
              alt="El Mar dins Meu — Logo far"
              className="h-20 w-auto"
            />
          </div>
          {/* Botons de compartir a les xarxes socials */}
          <div className="mb-6">
            <p className="text-white/70 text-xs uppercase font-semibold tracking-wider mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Comparteix el projecte
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {/* Instagram */}
              <button
                onClick={() => {
                  const text = "El Mar dins Meu — Un projecte per fer visible l'invisible, trencar tabús i sensibilitzar sobre les violències cap a la infància. Descobreix la nostra missió.";
                  const url = window.location.origin;
                  window.open(`https://www.instagram.com/?url=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                title="Compartir a Instagram"
              >
                <Instagram size={18} />
              </button>

              {/* Facebook */}
              <button
                onClick={() => {
                  const url = window.location.origin;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                title="Compartir a Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              {/* Twitter/X */}
              <button
                onClick={() => {
                  const text = "El Mar dins Meu — Un projecte per fer visible l'invisible, trencar tabús i sensibilitzar sobre les violències cap a la infància. Descobreix la nostra missió.";
                  const url = window.location.origin;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                title="Compartir a Twitter/X"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.868 6.75h-3.308l7.73-8.835L2.6 2.25h6.6l4.67 6.168L17.142 2.25h.102zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                </svg>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => {
                  const text = "Hola! M'interessa saber més sobre El Mar dins Meu i les samarretes del projecte.";
                  const whatsappNumber = "34629783012";
                  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110"
                style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
                title="Contacta'ns per WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.052 0-2.082.365-2.881 1.026l-.064.041-4.141-.666.679 4.029.036.057c.756 1.493 2.301 2.822 4.104 3.284.555.149 1.113.226 1.666.226 1.051 0 2.082-.365 2.881-1.026l.064-.041 4.141.666-.679-4.029-.036-.057c-.756-1.493-2.301-2.822-4.104-3.284-.555-.149-1.113-.226-1.666-.226m5.421-3.403C6.444 2.576 2.585 6.435 2.585 11.192c0 1.694.423 3.363 1.229 4.82L2.582 21.424l5.894-.952c1.408.743 2.998 1.134 4.656 1.134 4.757 0 8.616-3.859 8.616-8.616 0-2.306-.917-4.462-2.585-6.087-1.668-1.626-3.883-2.522-6.238-2.522m0-2c2.821 0 5.462 1.099 7.452 3.089 1.99 1.99 3.089 4.631 3.089 7.452 0 5.816-4.733 10.548-10.548 10.548-1.735 0-3.429-.429-4.953-1.241l-5.597.901.901-5.597c-.812-1.524-1.241-3.218-1.241-4.953 0-5.816 4.733-10.548 10.548-10.548"/>
                </svg>
              </button>
            </div>

            {/* Botó de copiar l'enllaç — a baix */}
            <div className="mt-4 relative">
              <CopyLinkButton />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <a href="https://instagram.com/elmardinsmeu" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <Instagram size={16} />
              <span>@elmardinsmeu</span>
            </a>
            <a href="mailto:escoltem@elmardinsmeu.cat" className="text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <Mail size={16} />
              <span>escoltem@elmardinsmeu.cat</span>
            </a>
          </div>
          <p className="text-white/40 text-xs"
            style={{ fontFamily: "'Nunito', sans-serif" }}>
            © 2026 El Mar dins Meu · Tots els drets reservats
          </p>
        </div>
      </footer>

      {/* Carro de compra */}
      <CartDrawer />
    </div>
  );
}
