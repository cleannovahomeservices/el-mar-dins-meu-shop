import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export default function AdminAnalytics() {
  const { data: analytics, isLoading, error } = trpc.orders.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading analytics: {error.message}
      </div>
    );
  }

  if (!analytics) {
    return <div className="p-6">No analytics data available</div>;
  }

  // Colors for charts
  const COLORS = ["#06b6d4", "#0891b2", "#0e7490", "#164e63", "#083344"];
  const paymentMethodLabels: Record<string, string> = {
    transferencia: "Transferència",
    "enmà": "En mà",
    stripe: "Stripe",
  };

  // Prepare data for payment method pie chart
  const paymentMethodData = Object.entries(analytics.revenueByPaymentMethod).map(([method, revenue]) => ({
    name: paymentMethodLabels[method] || method,
    value: revenue,
  }));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ color: "oklch(0.3 0.06 50)" }}>
          📊 Analítiques de Vendes
        </h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Comandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.deliveredOrders} entregades
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ingressos Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalRevenue}€</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.paidRevenue}€ pagats
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comandes Pagades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.paidOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.pendingOrders} pendents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ingressos Pendents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.pendingRevenue}€</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((analytics.pendingRevenue / analytics.totalRevenue) * 100).toFixed(1)}% del total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendència de Vendes Setmanal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.weeklySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}€`} />
                  <Line type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Ingressos per Forma de Pagament</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}€`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}€`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productes Més Venuts</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="quantity" fill="#06b6d4" name="Quantitat Venuda" />
                <Bar yAxisId="right" dataKey="revenue" fill="#0891b2" name="Ingressos (€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Details Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detalls dels Productes Més Venuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Producte</th>
                    <th className="text-right py-2 px-4">Quantitat</th>
                    <th className="text-right py-2 px-4">Ingressos</th>
                    <th className="text-right py-2 px-4">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((product, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{product.name}</td>
                      <td className="text-right py-2 px-4">{product.quantity}</td>
                      <td className="text-right py-2 px-4">{product.revenue}€</td>
                      <td className="text-right py-2 px-4">
                        {((product.revenue / analytics.totalRevenue) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
