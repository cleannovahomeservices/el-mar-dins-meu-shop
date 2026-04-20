/**
 * Stripe Checkout Handler
 * Creates checkout sessions for orders
 */

import Stripe from "stripe";
import { ENV } from "./_core/env";

const stripe = new Stripe(ENV.stripeSecretKey);

export interface CheckoutSessionInput {
  orderId: number;
  customerEmail: string;
  customerName: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  pickupPointId?: number;
  origin: string;
}

export async function createCheckoutSession(input: CheckoutSessionInput): Promise<string> {
  const lineItems: Stripe.Checkout.SessionCreateParams['line_items'] = [];

  // Group items by product type for Stripe
  const groupedItems: Record<string, { quantity: number; price: number }> = {};

  for (const item of input.items) {
    const key = item.name; // Use product name as key
    if (!groupedItems[key]) {
      groupedItems[key] = { quantity: 0, price: item.price };
    }
    groupedItems[key].quantity += item.quantity;
  }

  // Create line items for Stripe
  for (const [productName, { quantity, price }] of Object.entries(groupedItems)) {
    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: productName,
          description: `Samarreta 'El Mar dins Meu'`,
        },
        unit_amount: price * 100, // Convert to cents
      },
      quantity,
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems as any,
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: input.orderId.toString(),
    metadata: {
      order_id: input.orderId.toString(),
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      pickup_point_id: input.pickupPointId?.toString() || "null",
    },
    success_url: `${input.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/checkout/cancel`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
}

export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId);
}
