/**
 * Checkout Router
 * tRPC procedures for checkout and payment
 */

import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createCheckoutSession, getCheckoutSession } from "./stripe-checkout";
import { createOrder } from "./db";
import Stripe from "stripe";

const ENV = process.env;

export const checkoutRouter = router({
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        customerName: z.string().min(1, "Name is required"),
        customerEmail: z.string().email("Valid email is required"),
        items: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            size: z.string(),
            quantity: z.number().min(1),
            price: z.number().min(0),
          })
        ),
        pickupPointId: z.number().optional(),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Calculate total price
        const totalPrice = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Create order in database
        const itemsJson = JSON.stringify(
          input.items.map(item => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          }))
        );

        const result = await createOrder({
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: "",
          itemsJson,
          totalPrice: Math.round(totalPrice * 100),
          pickupPointId: input.pickupPointId || undefined,
          paymentMethod: "stripe",
          isPaid: 0,
          isDelivered: 0,
        });

        const orderId = (result as any).insertId || 1;

        // Create Stripe checkout session
        const checkoutUrl = await createCheckoutSession({
          orderId,
          customerEmail: input.customerEmail,
          customerName: input.customerName,
          items: input.items,
          totalPrice,
          pickupPointId: input.pickupPointId,
          origin: input.origin,
        });

        return {
          success: true,
          checkoutUrl,
          orderId,
        };
      } catch (error) {
        console.error("[Checkout] Error creating checkout session:", error);
        if (error instanceof Error && error.message === "Stripe is not configured") {
          throw new Error("Card payment is temporarily unavailable");
        }
        throw new Error("Failed to create checkout session");
      }
    }),

  getCheckoutSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const session = await getCheckoutSession(input.sessionId);
        return {
          success: true,
          session: {
            id: session.id,
            status: session.payment_status,
            customerEmail: session.customer_email,
            totalAmount: session.amount_total,
            metadata: session.metadata,
          },
        };
      } catch (error) {
        console.error("[Checkout] Error retrieving session:", error);
        if (error instanceof Error && error.message === "Stripe is not configured") {
          throw new Error("Card payment is temporarily unavailable");
        }
        throw new Error("Failed to retrieve checkout session");
      }
    }),
});
