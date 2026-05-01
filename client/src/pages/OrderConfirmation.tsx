import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, CreditCard, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface OrderData {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  itemsJson: string;
  totalPrice: number;
  pickupPointId?: number | null;
  paymentMethod: "transferencia" | "enmà" | "stripe";
  isPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ParsedOrderData extends OrderData {
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  pickupPointName?: string;
}

export default function OrderConfirmation() {
  const [location, navigate] = useLocation();
  const [order, setOrder] = useState<ParsedOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get order ID from URL params
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");
  const sessionId = params.get("session_id");

  // Fetch order details - using listAll and filtering
  const listOrdersQuery = trpc.orders.listAll.useQuery();

  useEffect(() => {
    if (listOrdersQuery.data && orderId) {
      const foundOrder = listOrdersQuery.data.find((o: any) => o.id === parseInt(orderId));
      if (foundOrder) {
        try {
          const items = JSON.parse(foundOrder.itemsJson);
          setOrder({
            ...foundOrder,
            items,
            pickupPointName: "Punt de recollida",
          } as ParsedOrderData);
        } catch (e) {
          setError("Error al processar la comanda");
        }
      } else {
        setError("No s'ha pogut trobar la comanda");
      }
      setLoading(false);
    }
    if (listOrdersQuery.error) {
      setError("No s'ha pogut carregar la comanda");
      setLoading(false);
    }
  }, [listOrdersQuery.data, listOrdersQuery.error, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Carregant confirmació de comanda...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error || "No s'ha pogut trobar la comanda"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Tornar a l'inici
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const itemsTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ✅ Comanda Confirmada!
          </h1>
          <p className="text-muted-foreground text-lg">
            Gràcies per la teva comanda. Aquí tens el resum de la teva compra.
          </p>
        </div>

        {/* Order Summary Card */}
        <Card className="mb-6 border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle>Resum de la Comanda</CardTitle>
            <CardDescription>Comanda #{order.id}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Items */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-foreground">Productes</h3>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Talla: {item.size} • Quantitat: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      {(item.price * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">{itemsTotal.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-foreground">TOTAL:</span>
                <span className="text-green-600">{order.totalPrice.toFixed(2)}€</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-secondary/50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2 text-foreground">Dades de Contacte</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Nom:</strong> {order.customerName}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Telèfon:</strong> {order.customerPhone}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> {order.customerEmail}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Data de comanda:</strong> {new Date(order.createdAt).toLocaleDateString("ca-ES")}
              </p>
            </div>

            {/* Pickup Point */}
            {order.pickupPointName && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Punt de Recollida</h4>
                    <p className="text-sm text-blue-800">{order.pickupPointName}</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Recollida a partir de Maig 2026
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className={`p-4 rounded-lg mb-6 border-2 ${
              order.isPaid 
                ? "bg-green-50 border-green-200" 
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <div className="flex items-start gap-3">
                <CreditCard className={`w-5 h-5 mt-1 flex-shrink-0 ${
                  order.isPaid ? "text-green-600" : "text-yellow-600"
                }`} />
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    order.isPaid ? "text-green-900" : "text-yellow-900"
                  }`}>
                    {order.isPaid ? "✅ Pagament Rebut" : "⏳ Pagament Pendent"}
                  </h4>
                  <p className={`text-sm ${
                    order.isPaid ? "text-green-800" : "text-yellow-800"
                  }`}>
                    {order.paymentMethod === "stripe" && !order.isPaid && (
                      "Completa el pagament a Stripe per confirmar la comanda."
                    )}
                    {order.paymentMethod === "transferencia" && !order.isPaid && (
                      "Realitza una transferència bancària a escoltem@elmardinsmeu.cat"
                    )}
                    {order.paymentMethod === "enmà" && !order.isPaid && (
                      "Pagament en mà al punt de recollida."
                    )}
                    {order.isPaid === 1 && (
                      "La teva comanda està confirmada. Et contactarem per confirmar la data de recollida."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-primary/5 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-foreground">Pròxims Passos</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Rebràs un correu de confirmació amb els detalls de la comanda</li>
                <li>Realitza el pagament (si no l'has fet ja)</li>
                <li>Et contactarem per confirmar la data i hora de recollida</li>
                <li>Recull la teva comanda al punt de recollida seleccionat</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="px-6"
          >
            Tornar a l'inici
          </Button>
          <Button
            onClick={() => navigate("/punts-recollida")}
            className="px-6"
          >
            Veure Punts de Recollida
          </Button>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Tens alguna pregunta?</p>
          <p>
            Contacta'ns a{" "}
            <a href="mailto:escoltem@elmardinsmeu.cat" className="text-primary hover:underline">
              escoltem@elmardinsmeu.cat
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
