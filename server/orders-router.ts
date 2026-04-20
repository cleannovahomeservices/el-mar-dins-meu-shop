import { router } from "./_core/trpc";
import { getDb } from "./db";
import { orders, pickupPoints, payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "./_core/trpc";

export const ordersRouter = router({
  // Get all orders for the current user (by email)
  getMyOrders: protectedProcedure.query(async ({ ctx }: any) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const userOrders = await db
      .select({
        id: orders.id,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        customerPhone: orders.customerPhone,
        itemsJson: orders.itemsJson,
        totalPrice: orders.totalPrice,
        paymentMethod: orders.paymentMethod,
        isPaid: orders.isPaid,
        isDelivered: orders.isDelivered,
        createdAt: orders.createdAt,
        pickupPointId: orders.pickupPointId,
        pickupPointName: pickupPoints.name,
        pickupPointAddress: pickupPoints.address,
        pickupPointCity: pickupPoints.city,
        pickupPointPostalCode: pickupPoints.postalCode,
        paymentStatus: payments.status,
        stripeSessionId: payments.stripeSessionId,
      })
      .from(orders)
      .leftJoin(pickupPoints, eq(orders.pickupPointId, pickupPoints.id))
      .leftJoin(payments, eq(orders.id, payments.orderId))
      .where(eq(orders.customerEmail, ctx.user.email || ""))
      .orderBy(orders.createdAt);

    return userOrders;
  }),

  // Get single order details
  getOrder: protectedProcedure
    .input((value: any) => {
      if (typeof value === "string" || typeof value === "number") return value;
      throw new Error("Order ID must be a string or number");
    })
    .query(async ({ ctx, input: orderId }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const order = await db
        .select({
          id: orders.id,
          customerName: orders.customerName,
          customerEmail: orders.customerEmail,
          customerPhone: orders.customerPhone,
          itemsJson: orders.itemsJson,
          totalPrice: orders.totalPrice,
          paymentMethod: orders.paymentMethod,
          isPaid: orders.isPaid,
          isDelivered: orders.isDelivered,
          createdAt: orders.createdAt,
          pickupPointId: orders.pickupPointId,
          pickupPointName: pickupPoints.name,
          pickupPointAddress: pickupPoints.address,
          pickupPointCity: pickupPoints.city,
          pickupPointPostalCode: pickupPoints.postalCode,
          paymentStatus: payments.status,
          stripeSessionId: payments.stripeSessionId,
        })
        .from(orders)
        .leftJoin(pickupPoints, eq(orders.pickupPointId, pickupPoints.id))
        .leftJoin(payments, eq(orders.id, payments.orderId))
        .where(eq(orders.id, typeof orderId === "string" ? parseInt(orderId) : orderId))
        .limit(1);

      if (!order.length || order[0].customerEmail !== ctx.user.email) {
        throw new Error("Order not found or unauthorized");
      }

      return order[0];
    }),
});
