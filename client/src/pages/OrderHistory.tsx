import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Package, MapPin, DollarSign, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function OrderHistory() {
  const { user, loading: authLoading } = useAuth();
  const { data: orders, isLoading } = trpc.orders.getMyOrders.useQuery(undefined, {
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold">Necessites iniciar sessió per veure les teves comandes</p>
        <Link href="/">
          <Button>Tornar a l'inici</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Les meves comandes</h1>
          <p className="text-gray-600">Visualitza l'historial de les teves comandes i el seu estat de pagament</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin mr-2" />
            <span>Carregant comandes...</span>
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-600 mb-4">Encara no tens cap comanda</p>
            <Link href="/compra">
              <Button>Fer una comanda</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order: any) => {
              const items = JSON.parse(order.itemsJson || "[]");
              const isPaid = order.isPaid === 1;
              const isDelivered = order.isDelivered === 1;

              return (
                <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informació de la comanda */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-xl font-bold">Comanda #{order.id}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {isPaid ? "Pagada" : "Pendent de pagament"}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span>{new Date(order.createdAt).toLocaleDateString("ca-ES")}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign size={16} />
                          <span className="font-semibold text-lg">{(order.totalPrice / 100).toFixed(2)}€</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Package size={16} />
                          <span>{items.length} producte{items.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>

                      {/* Productes */}
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2">Productes:</h4>
                        <ul className="space-y-1 text-sm">
                          {items.map((item: any, idx: number) => (
                            <li key={idx} className="text-gray-600">
                              {item.name} - Talla {item.size} x{item.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Informació de recollida */}
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin size={18} />
                        Punt de recollida
                      </h4>

                      {order.pickupPointId ? (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="font-semibold text-lg mb-2">Seleccionat</p>
                          <p className="text-sm text-gray-600 mb-3">
                            Punt ID: {order.pickupPointId}
                          </p>

                          <div className={`px-3 py-2 rounded text-sm font-semibold text-center ${
                            isDelivered ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                          }`}>
                            {isDelivered ? "Recollit" : "Pendent de recollida"}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-lg text-gray-600">
                          <p className="text-sm">No s'ha seleccionat punt de recollida</p>
                        </div>
                      )}

                      {/* Informació de pagament */}
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold mb-2">Mètode de pagament:</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          {order.paymentMethod === "transferencia" && "Transferència bancària"}
                          {order.paymentMethod === "enmà" && "En mà"}
                          {order.paymentMethod === "stripe" && "Targeta de crèdit"}
                        </p>

                        {!isPaid && order.paymentMethod === "stripe" && (
                          <Button className="mt-3 w-full" variant="default">
                            Completar pagament
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
