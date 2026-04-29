import { useState } from "react";
import { Link } from "wouter";
import { LayoutGrid, Package, ShoppingBag, Instagram, Mail } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import ProductCard, { type Product } from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/_core/hooks/useAuth";
import { WorkshopReviewForm } from "@/components/WorkshopReviewForm";
import { WorkshopReviewsCarousel } from "@/components/WorkshopReviewsCarousel";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296928445/NnesjWskmtgTij7oaTjBUS";

const PRODUCTS: Product[] = [
  {
    id: "samarreta-noi",
    name: "Samarreta Ampla",
    subtitle: "El Mar dins Meu",
    price: 18,
    preventa: true,
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
    images: [`${CDN}/samarreta_noi_interior_nova_e1a4f154.png`, `${CDN}/samarreta_noi_exterior_nova_3890a708.png`],
    sizeGuideImg: `${CDN}/taula_talles_noi_056863df.jpg`,
    available: true,
  },
  {
    id: "samarreta-noia",
    name: "Samarreta Entallada",
    subtitle: "El Mar dins Meu",
    price: 18,
    preventa: true,
    sizes: ["S", "M", "L", "XL", "2XL"],
    images: [`${CDN}/samarreta_noia_real_0a3b22c7.jpg`, `${CDN}/noia_exterior_28cca105.jpg`],
    sizeGuideImg: `${CDN}/taula_talles_noia_2980b7fb.jpg`,
    available: true,
  },
  {
    id: "samarreta-tirants",
    name: "Samarreta Tirants",
    subtitle: "El Mar dins Meu",
    price: 18,
    preventa: true,
    sizes: ["S", "M", "L", "XL", "2XL"],
    images: [`${CDN}/tirants_frontal_749e359c.jpg`, `${CDN}/tirants_esquena_nova_0aa85d8d.jpg`],
    sizeGuideImg: `${CDN}/taula_talles_tirants_5490a192.jpg`,
    available: true,
  },
  {
    id: "samarreta-infantil",
    name: "Samarreta Infantil",
    subtitle: "El Mar dins Meu",
    price: 15,
    preventa: true,
    sizes: ["3/4", "5/6", "7/8", "9/10", "11/12"],
    images: [`${CDN}/infantil_nena_nova_ac666b14.jpg`, `${CDN}/infantil_nena2_6f81c493.jpg`],
    sizeGuideImg: `${CDN}/taula_talles_noi_056863df.jpg`,
    available: true,
  },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomeCampaign() {
  const { totalItems, openCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: "oklch(0.72 0.08 200)" }}>
      <header className="sticky top-0 z-30 backdrop-blur-md" style={{ background: "oklch(0.55 0.1 200 / 0.95)" }}>
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
            <div>
              <h1 className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>El Mar dins Meu</h1>
              <p className="text-white/85 text-xs" style={{ fontFamily: "'Nunito', sans-serif" }}>Fem visible l'invisible</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && !isAdmin && (
              <Link href="/comandes">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-sm text-white"
                  style={{ background: "oklch(0.45 0.1 200 / 0.7)" }}>
                  <Package size={15} />
                  <span className="hidden sm:inline text-xs">Comandes</span>
                </button>
              </Link>
            )}

            {isAdmin && (
              <div className="relative">
                <button onClick={() => setAdminMenuOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-sm text-white"
                  style={{ background: "oklch(0.45 0.1 200 / 0.7)" }}>
                  <LayoutGrid size={15} />
                  <span className="hidden sm:inline text-xs">Admin</span>
                </button>
                {adminMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 rounded-xl overflow-hidden bg-white min-w-[170px]">
                    <Link href="/admin/comandes"><div className="px-4 py-2 text-sm">Comandes</div></Link>
                    <Link href="/admin/ressenyes"><div className="px-4 py-2 text-sm">Ressenyes</div></Link>
                    <Link href="/admin/analitiques"><div className="px-4 py-2 text-sm">Analítiques</div></Link>
                  </div>
                )}
              </div>
            )}

            <button onClick={openCart}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
              style={{ background: "oklch(0.88 0.06 75)", color: "oklch(0.35 0.07 55)" }}>
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Cistella</span>
              {totalItems > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center" style={{ background: "oklch(0.45 0.1 200)" }}>{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      <section id="hero" className="py-10 sm:py-14" style={{ background: "oklch(0.97 0.01 55)" }}>
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-black text-4xl sm:text-5xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>El mar dins meu</h2>
            <p className="text-xl sm:text-2xl font-bold mb-3" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.45 0.1 200)" }}>Fem visible l'invisible</p>
            <p className="text-base sm:text-lg leading-relaxed max-w-xl" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.4 0.05 55)" }}>
              Un projecte per fer visible una realitat sovint silenciada: l'abús sexual infantil.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => scrollToId("samarretes")} className="px-6 py-3 rounded-xl font-bold text-white" style={{ background: "oklch(0.55 0.1 200)" }}>Comprar samarreta</button>
              <button onClick={() => scrollToId("participa")} className="px-6 py-3 rounded-xl font-bold" style={{ background: "oklch(0.88 0.06 75)", color: "oklch(0.35 0.07 55)" }}>Participa</button>
            </div>
          </div>
          <img src={`${CDN}/portada_illustracio_668c66a4.png`} alt="Portada" className="w-full rounded-2xl" style={{ maxHeight: "440px", objectFit: "contain", background: "white" }} />
        </div>
      </section>

      <section className="py-10" style={{ background: "oklch(0.96 0.03 80)" }}>
        <div className="container">
          <p className="text-center text-lg max-w-4xl mx-auto leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.35 0.06 55)" }}>
            El mar dins meu és un àlbum il·lustrat i un projecte educatiu que vol fer visible una realitat sovint silenciada: l'abús sexual infantil.
          </p>
          <div className="mt-4 text-center text-sm font-semibold" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.45 0.1 200)" }}>
            Projecte social + donació a Àngel Blau + campanya en pre-comanda
          </div>
        </div>
      </section>

      <section id="participa" className="py-12" style={{ background: "oklch(0.98 0.01 75)" }}>
        <div className="container">
          <h3 className="text-center font-black text-3xl mb-8" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>Com formar part del projecte</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              ["Samarretes", "Compra una samarreta i ajuda a fer créixer el projecte i a fer visible una realitat sovint silenciada."],
              ["Conte 'El mar dins meu'", "Un àlbum il·lustrat per parlar, posar paraules i obrir espais de consciència sobre l'abús sexual infantil."],
              ["Xerrades i tallers", "Organitzem xerrades, tallers i espais de diàleg per sensibilitzar i prevenir l'abús sexual infantil."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl p-6 bg-white" style={{ border: "2px solid oklch(0.88 0.06 75)" }}>
                <h4 className="font-black text-xl mb-3" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.35 0.07 55)" }}>{title}</h4>
                <p className="text-sm leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.45 0.04 55)" }}>{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="font-bold mb-3" style={{ fontFamily: "'Nunito', sans-serif", color: "oklch(0.35 0.06 55)" }}>Vols portar el projecte al teu espai?</p>
            <button onClick={() => scrollToId("contacte")} className="px-6 py-3 rounded-xl font-bold text-white" style={{ background: "oklch(0.55 0.1 200)" }}>Contacte</button>
          </div>
        </div>
      </section>

      <main id="samarretes" className="container py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 font-bold text-sm" style={{ background: "oklch(0.75 0.18 55)", color: "white" }}>
            ⏳ PRE-COMANDA oberta fins al 30 de maig
          </div>
          <h2 className="text-white font-black text-3xl sm:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>Samarretes</h2>
          <p className="text-white/90 mt-2 text-base max-w-xl mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Amb la compra d'una samarreta ens ajudes a sensibilitzar i prevenir l'abús sexual infantil.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={() => scrollToId("samarretes")} className="px-6 py-3 rounded-xl font-bold text-white" style={{ background: "oklch(0.55 0.1 200)" }}>Comprar samarreta</button>
            <button onClick={() => scrollToId("participa")} className="px-6 py-3 rounded-xl font-bold" style={{ background: "oklch(0.88 0.06 75)", color: "oklch(0.35 0.07 55)" }}>Participa</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-10">
          {PRODUCTS.map((product, idx) => <ProductCard key={product.id} product={product} delay={idx * 120} />)}
        </div>
      </main>

      <section className="py-10" style={{ background: "oklch(0.62 0.09 200 / 0.5)" }}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white font-black text-xl sm:text-2xl leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Els beneficis de la venda es destinen íntegrament a l'associació Àngel Blau. El càlcul es farà en finalitzar la campanya.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12" style={{ background: "oklch(0.55 0.1 200)" }}>
        <div className="container">
          <h3 className="text-white font-black text-3xl text-center mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Com funciona</h3>
          <div className="max-w-3xl mx-auto rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.12)" }}>
            <p className="text-white leading-relaxed mb-4">Campanya oberta fins al 30 de maig.</p>
            <p className="text-white leading-relaxed mb-4">Aquesta és una campanya en pre-comanda. Produirem les samarretes un cop finalitzada.</p>
            <p className="text-white leading-relaxed mb-5">Els enviaments i recollides es faran a partir de mitjans de juny.</p>
            <ul className="space-y-2 text-white font-semibold">
              <li>Recollida gratuïta</li>
              <li>Enviament a domicili: 5 €</li>
              <li>Enviament gratuït a partir de 50 €</li>
            </ul>
          </div>
          <p className="text-center text-white/90 text-sm mt-5">Pagament amb targeta o transferència</p>
          <p className="text-center text-white/75 text-xs mt-1">El pagament es gestiona a través del nostre compte.</p>
        </div>
      </section>

      <section className="py-12" style={{ background: "oklch(0.96 0.03 80)" }}>
        <div className="container max-w-3xl">
          <h3 className="text-center font-black text-3xl mb-8" style={{ fontFamily: "'Playfair Display', serif", color: "oklch(0.3 0.06 50)" }}>FAQ</h3>
          <div className="space-y-3">
            {[
              ["Quan arribarà la meva comanda?", "És una pre-comanda. Els enviaments i recollides es faran a partir de mitjans de juny."],
              ["Com puc participar en el projecte?", "Pots comprar una samarreta, compartir el conte o organitzar una xerrada/taller al teu espai."],
              ["Hi ha opció d'enviament i recollida?", "Sí. Pots triar recollida gratuïta o enviament a domicili per 5€ (gratis a partir de 50€)."],
              ["Com puc contactar-vos?", "Des del formulari de contacte de la web i també per correu a escoltem@elmardinsmeu.cat."],
            ].map(([q, a]) => (
              <details key={q} className="bg-white rounded-xl p-4" style={{ border: "2px solid oklch(0.88 0.06 75)" }}>
                <summary className="font-bold cursor-pointer">{q}</summary>
                <p className="mt-2 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12" style={{ background: "oklch(0.98 0.01 75)" }}>
        <div className="container max-w-2xl mx-auto space-y-8">
          <WorkshopReviewsCarousel />
          <WorkshopReviewForm />
        </div>
      </section>

      <section id="contacte" className="py-8" style={{ background: "oklch(0.35 0.07 200)" }}>
        <div className="container text-center">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <a href="https://instagram.com/elmardinsmeu" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <Instagram size={16} />
              <span>@elmardinsmeu</span>
            </a>
            <a href="mailto:escoltem@elmardinsmeu.cat" className="text-white/80 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <Mail size={16} />
              <span>escoltem@elmardinsmeu.cat</span>
            </a>
          </div>
          <p className="text-white/50 text-xs">© 2026 El Mar dins Meu · Tots els drets reservats</p>
        </div>
      </section>

      <CartDrawer />
    </div>
  );
}
