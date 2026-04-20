/* =============================================================
   CartDrawer — El Mar dins Meu
   Drawer lateral del carro de compra amb resum i pagament
   ============================================================= */

import { useCart } from "@/contexts/CartContext";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";
import CheckoutModal from "./CheckoutModal";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 cart-drawer flex flex-col"
        style={{ animation: "slideInRight 0.3s ease" }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[oklch(0.85_0.04_75)]"
          style={{ background: "oklch(0.65 0.1 200)" }}>
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-white" size={22} />
            <h2 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              La meva cistella
            </h2>
            {totalItems > 0 && (
              <span className="bg-white text-[oklch(0.35_0.07_55)] text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="text-white hover:opacity-70 transition-opacity">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag size={48} className="text-[oklch(0.7_0.06_75)] mb-4" />
              <p className="text-[oklch(0.45_0.05_55)] text-lg font-medium" style={{ fontFamily: "'Nunito', sans-serif" }}>
                La cistella és buida
              </p>
              <p className="text-[oklch(0.6_0.04_55)] text-sm mt-2">
                Afegeix alguna samarreta per continuar
              </p>
              <button
                onClick={closeCart}
                className="mt-6 btn-primary px-6 py-2 text-sm"
              >
                Veure el catàleg
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.size}`}
                className="bg-white rounded-xl p-4 flex gap-4 shadow-sm border border-[oklch(0.9_0.03_75)]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[oklch(0.3_0.06_50)] text-sm leading-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    {item.name}
                  </h3>
                  <p className="text-[oklch(0.55_0.08_200)] text-xs font-semibold mt-1">
                    Talla: {item.size}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    {/* Quantitat */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border-2 border-[oklch(0.75_0.07_70)] flex items-center justify-center text-[oklch(0.4_0.06_55)] hover:bg-[oklch(0.88_0.06_75)] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-[oklch(0.3_0.06_50)] w-5 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border-2 border-[oklch(0.75_0.07_70)] flex items-center justify-center text-[oklch(0.4_0.06_55)] hover:bg-[oklch(0.88_0.06_75)] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    {/* Preu + eliminar */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[oklch(0.35_0.07_55)] text-base"
                        style={{ fontFamily: "'Playfair Display', serif" }}>
                        {(item.price * item.quantity).toFixed(0)}€
                      </span>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-[oklch(0.6_0.04_55)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer amb total i pagament */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[oklch(0.85_0.04_75)] space-y-4"
            style={{ background: "oklch(0.94 0.03 78)" }}>
            {/* Enviament */}
            <div className="flex justify-between text-sm text-[oklch(0.5_0.04_55)]">
              <span>Enviament</span>
              <span className="font-semibold">A consultar</span>
            </div>
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-[oklch(0.3_0.06_50)] font-bold text-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Total
              </span>
              <span className="text-[oklch(0.35_0.07_55)] font-bold text-2xl"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {totalPrice.toFixed(0)}€
              </span>
            </div>
            {/* Botó continuar comprant */}
            <button
              onClick={closeCart}
              className="w-full py-3 text-sm font-bold rounded-xl border-2 transition-all hover:opacity-80"
              style={{ borderColor: "oklch(0.65 0.1 200)", color: "oklch(0.45 0.1 200)", background: "white" }}
            >
              ← Continuar comprant
            </button>
            {/* Botó fer encàrrec */}
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full btn-primary py-4 text-base font-bold rounded-xl"
            >
              Fer l'encàrrec →
            </button>
            <p className="text-center text-xs text-[oklch(0.55_0.04_55)]">
              Pagament per transferència o en mà
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {showCheckout && (
        <CheckoutModal
          items={items}
          totalPrice={totalPrice}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
