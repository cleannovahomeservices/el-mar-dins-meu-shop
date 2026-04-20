/**
 * Stripe Webhook Handler
 * Handles Stripe events for payment confirmation
 */

import { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { updateOrderStatus } from "./db";
import { sendPaymentConfirmationEmail } from "./mailer";

const stripe = new Stripe(ENV.stripeSecretKey);

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    console.error("[Webhook] Missing stripe-signature header");
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (error) {
    console.error("[Webhook] Signature verification failed:", error);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("[Webhook] Checkout session completed:", session.id);

  const orderId = parseInt(session.client_reference_id || "0");
  if (!orderId) {
    console.error("[Webhook] No order ID found in session metadata");
    return;
  }

  try {
    // Update order as paid
    await updateOrderStatus(orderId, {
      isPaid: 1,
    });

    // Send payment confirmation email
    if (session.customer_email) {
      await sendPaymentConfirmationEmail({
        customerEmail: session.customer_email,
        customerName: session.metadata?.customer_name || "Customer",
        paymentMethod: "stripe",
        totalPrice: (session.amount_total || 0) / 100,
        items: [], // Items will be fetched from order in the email template
      });
    }

    console.log("[Webhook] Order marked as paid:", orderId);
  } catch (error) {
    console.error("[Webhook] Error updating order:", error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("[Webhook] Payment intent succeeded:", paymentIntent.id);

  // Find order by payment intent metadata
  const orderId = paymentIntent.metadata?.order_id;
  if (!orderId) {
    console.error("[Webhook] No order ID found in payment intent metadata");
    return;
  }

  try {
    await updateOrderStatus(parseInt(orderId), {
      isPaid: 1,
    });

    console.log("[Webhook] Order marked as paid via payment intent:", orderId);
  } catch (error) {
    console.error("[Webhook] Error updating order:", error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("[Webhook] Payment intent failed:", paymentIntent.id);

  const orderId = paymentIntent.metadata?.order_id;
  if (!orderId) {
    console.error("[Webhook] No order ID found in payment intent metadata");
    return;
  }

  try {
    // Update order status to reflect payment failure
    await updateOrderStatus(parseInt(orderId), {
      isPaid: 0,
      adminNotes: `Payment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
    });

    console.log("[Webhook] Order payment marked as failed:", orderId);
  } catch (error) {
    console.error("[Webhook] Error updating order:", error);
    throw error;
  }
}
