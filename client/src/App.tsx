/* =============================================================
   App — El Mar dins Meu Botiga
   Disseny: Mediterrània Artesanal
   ============================================================= */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import AdminReviews from "./pages/AdminReviews";
import AdminOrders from "./pages/AdminOrders";
import AdminWorkshopReviews from "./pages/AdminWorkshopReviews";
import RegisterPickupPoint from "./pages/RegisterPickupPoint";
import AdminPickupPoints from "./pages/AdminPickupPoints";
import PickupPointsPage from "./pages/PickupPoints";
import PartnerMaterials from "./pages/PartnerMaterials";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AdminAnalytics from "./pages/AdminAnalytics";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/contacte" component={Contact} />
      <Route path="/punts-recollida" component={PickupPointsPage} />
      <Route path="/registre-punt-recollida" component={RegisterPickupPoint} />
      <Route path="/materials-partners" component={PartnerMaterials} />
      <Route path="/confirmacio-comanda" component={OrderConfirmation} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/comandes" component={OrderHistory} />
      <Route path="/admin/ressenyes" component={AdminReviews} />
      <Route path="/admin/ressenyes-tallers" component={AdminWorkshopReviews} />
      <Route path="/admin/comandes" component={AdminOrders} />
      <Route path="/admin/punts-recollida" component={AdminPickupPoints} />
      <Route path="/admin/analitiques" component={AdminAnalytics} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster position="top-center" />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
