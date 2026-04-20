/* =============================================================
   ProductCard — El Mar dins Meu
   Targeta de producte estil polaroid/collage, seguint la plantilla
   Inclou: fotos en angle, etiqueta kraft per talles, preu en rodó
   ============================================================= */

import { useState } from "react";
import { ShoppingBag, Plus, Share2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  preventa?: boolean;
  sizes: string[];
  images: string[];
  rotation: number; // graus de rotació de la targeta
  available: boolean;
  sizeGuideImg?: string; // imatge de la guia de talles
}

interface Props {
  product: Product;
  delay?: number;
}

export default function ProductCard({ product, delay = 0 }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const { addItem } = useCart();

  const handleShareWhatsApp = () => {
    const url = "https://elmarshop-nnesjwsk.manus.space";
    const text = `Descobreix aquest producte de El Mar dins Meu i uneix-te al projecte! 💜 ${url} #ElMardinsMeu`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Selecciona una talla primer!", {
        style: { fontFamily: "'Nunito', sans-serif" }
      });
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      image: product.images[0],
    });
    toast.success(`${product.name} (T. ${selectedSize}) afegit!`, {
      style: { fontFamily: "'Nunito', sans-serif" }
    });
  };

  return (
    <div
      className="animate-fade-slide-up"
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      <div
        className="product-card"
        style={{ transform: `rotate(${product.rotation}deg)` }}
      >
        {/* Contenidor de la foto estil polaroid */}
        <div className="relative p-3 pb-0">
          {/* Badge preventa */}
          {product.preventa && (
            <div className="absolute top-1 right-1 z-10 px-2 py-0.5 rounded-full text-white font-bold text-xs"
              style={{ background: "oklch(0.65 0.18 55)", fontFamily: "'Nunito', sans-serif", fontSize: "10px" }}>
              PREVENTA
            </div>
          )}
          {/* Títol del producte (estil plantilla: caixa beix arrodonida) */}
          <div className="product-title-box px-4 py-2 mb-3 text-center">
            <h3 className="font-black text-base uppercase tracking-wide leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h3>
            <p className="text-xs font-semibold opacity-70 mt-0.5"
              style={{ fontFamily: "'Nunito', sans-serif" }}>
              {product.subtitle}
            </p>
          </div>

          {/* Fotos (2 si disponibles, estil collage) */}
          <div className={`grid gap-2 ${product.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {product.images.slice(0, 2).map((img, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-sm"
                style={{
                  transform: idx === 0 ? "rotate(-1.5deg)" : "rotate(1deg)",
                  boxShadow: "2px 3px 8px rgba(0,0,0,0.2)",
                }}
              >
                <img
                  src={img}
                  alt={product.name}
                  className="w-full object-cover object-center"
                  style={{ height: product.images.length > 1 ? "200px" : "280px" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Peu de la targeta: etiqueta kraft + preu + talla */}
        <div className="p-3 pt-4">
          <div className="flex items-end justify-end gap-2">
            {/* Preu en rodó */}
            <div className="price-bubble w-16 h-16 flex-shrink-0">
              <span className="text-xl font-black leading-none">{product.price}€</span>
            </div>
          </div>

          {/* Selector de talla */}
          <div className="mt-3">
            <p className="text-xs font-semibold text-[oklch(0.5_0.04_55)] mb-2 uppercase tracking-wide">
              Selecciona la talla:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                  className={`size-btn px-3 py-1.5 text-xs ${selectedSize === size ? "selected" : ""}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Botó afegir al carro */}
          <button
            onClick={handleAddToCart}
            disabled={!product.available}
            className="w-full btn-primary mt-3 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50"
          >
            <ShoppingBag size={16} />
            {product.available ? "Afegir a la cistella" : "No disponible"}
          </button>

          {/* Botó compartir a WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full mt-2 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "#25D366",
              color: "white",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Comparteix a WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
