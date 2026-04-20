/* =============================================================
   CartContext — El Mar dins Meu
   Gestió del carro de compra (localStorage persistent)
   ============================================================= */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  selectedPickupPointId: number | null;
  setSelectedPickupPointId: (id: number | null) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("elmardinsmeu-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPickupPointId, setSelectedPickupPointId] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem("elmardinsmeu-pickup-point");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [customerName, setCustomerName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("elmardinsmeu-customer-name");
      return saved ? JSON.parse(saved) : "";
    } catch {
      return "";
    }
  });
  const [customerEmail, setCustomerEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("elmardinsmeu-customer-email");
      return saved ? JSON.parse(saved) : "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    localStorage.setItem("elmardinsmeu-cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("elmardinsmeu-pickup-point", JSON.stringify(selectedPickupPointId));
  }, [selectedPickupPointId]);

  useEffect(() => {
    localStorage.setItem("elmardinsmeu-customer-name", JSON.stringify(customerName));
  }, [customerName]);

  useEffect(() => {
    localStorage.setItem("elmardinsmeu-customer-email", JSON.stringify(customerEmail));
  }, [customerEmail]);

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === newItem.id && i.size === newItem.size);
      if (existing) {
        return prev.map(i =>
          i.id === newItem.id && i.size === newItem.size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string, size: string) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)));
  };

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.id === id && i.size === size ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalPrice,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      selectedPickupPointId, setSelectedPickupPointId,
      customerName, setCustomerName,
      customerEmail, setCustomerEmail
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
