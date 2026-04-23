import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createReview,
  getApprovedReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  createOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  createPickupPoint,
  getApprovedPickupPoints,
  getAllPickupPoints,
  updatePickupPointStatus,
  deletePickupPoint,
  createWorkshopReview,
  getApprovedWorkshopReviews,
  getAllWorkshopReviews,
  updateWorkshopReviewStatus,
  deleteWorkshopReview,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { sendOrderEmail, sendClientConfirmationEmail, sendDeliveryEmail, sendPaymentReminderEmail, sendContactEmail, sendPaymentConfirmationEmail, sendOrderReadyEmail } from "./mailer";
import { sendWelcomeEmailToPickupPoint } from "./_core/emailService";
import { geocodeAddressWithFallback } from "./geocoding";
import { partnerPdfRouter } from "./partner-pdf-router";
import { checkoutRouter } from "./checkout-router";

// Procediment exclusiu per a admins
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accés restringit a administradors" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  partnerPdf: partnerPdfRouter,
  checkout: checkoutRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    adminLogin: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const { ENV } = await import("./_core/env");
        const { sdk } = await import("./_core/sdk");
        const { COOKIE_NAME, ONE_YEAR_MS } = await import("@shared/const");

        if (input.password !== ENV.adminSecret) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Contrasenya incorrecta" });
        }
        if (!ENV.adminEmails.includes(input.email)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Aquest correu no té permisos d'administrador" });
        }

        const openId = `admin_${input.email}`;
        const { upsertUser } = await import("./db");
        await upsertUser({ openId, name: input.email, email: input.email, loginMethod: "admin", role: "admin", lastSignedIn: new Date() });

        const sessionToken = await sdk.createSessionToken(openId, { name: input.email, expiresInMs: ONE_YEAR_MS });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),
  }),

  // ── Comandes ─────────────────────────────────────────────────
  orders: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(2).max(128),
          phone: z.string().min(6).max(30),
          email: z.string().email(),
          notes: z.string().max(500).optional(),
          paymentMethod: z.enum(["transferencia", "enmà"]),
          pickupPointId: z.number().int().positive(),
          items: z.array(z.object({
            name: z.string(),
            size: z.string(),
            quantity: z.number().int().positive(),
            price: z.number().positive(),
          })),
          totalPrice: z.number().positive(),
        })
      )
      .mutation(async ({ input }) => {
        const paymentLabels: Record<string, string> = {
          transferencia: "Transferència bancària",
          "enmà": "Pagament en mà",
        };

        const itemsList = input.items
          .map(i => `  • ${i.name} (Talla ${i.size}) x${i.quantity} = ${(i.price * i.quantity).toFixed(0)}€`)
          .join("\n");

        const orderText =
          `🌊 NOVA COMANDA — El Mar dins Meu 🌊\n\n` +
          `👤 Nom: ${input.name}\n` +
          `📱 Telèfon: ${input.phone}\n` +
          `📧 Email: ${input.email ?? "No indicat"}\n\n` +
          `🛍️ Productes:\n${itemsList}\n\n` +
          `💰 TOTAL: ${input.totalPrice.toFixed(0)}€\n` +
          `💳 Forma de pagament: ${paymentLabels[input.paymentMethod]}\n` +
          (input.notes ? `\n📝 Notes: ${input.notes}\n` : "") +
          `\n⏳ Preventa — Recollida a partir de Maig 2026`;

        // 1. Guardar la comanda a la base de dades
        await createOrder({
          customerName: input.name,
          customerPhone: input.phone,
          customerEmail: input.email,
          notes: input.notes ?? null,
          paymentMethod: input.paymentMethod,
          pickupPointId: input.pickupPointId,
          totalPrice: Math.round(input.totalPrice),
          itemsJson: JSON.stringify(input.items),
          isPaid: 0,
          isDelivered: 0,
        }).catch((err) => console.error("[Orders] Failed to save order:", err));

        // 2. Enviar correu electrònic al propietari
        const emailSent = await sendOrderEmail(input).catch(() => false);

        // 3. Enviar confirmació automàtica al client
        await sendClientConfirmationEmail(input).catch(() => {});

        // 4. Notificació interna de Manus com a còpia de seguretat
        await notifyOwner({
          title: `Nova comanda de ${input.name} — ${input.totalPrice.toFixed(0)}€`,
          content: orderText,
        }).catch(() => {});

        return { success: true, emailSent };
      }),

    // Admin: llistar totes les comandes
    listAll: adminProcedure.query(async () => {
      return getAllOrders();
    }),

    // Admin: actualitzar estat de pagament/entrega/notes
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          isPaid: z.number().int().min(0).max(1).optional(),
          isDelivered: z.number().int().min(0).max(1).optional(),
          adminNotes: z.string().max(500).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;

        // Obtenir la comanda actual per saber si isDelivered canvia de 0 a 1
        const allOrders = await getAllOrders();
        const order = allOrders.find((o: { id: number }) => o.id === id);

        await updateOrderStatus(id, data);

        // Enviar correu de confirmació de pagament si la comanda passa a pagada
        if (input.isPaid === 1 && order && order.isPaid === 0 && order.customerEmail) {
          const items = JSON.parse(order.itemsJson || "[]") as Array<{
            name: string;
            size: string;
            quantity: number;
            price: number;
          }>;
          await sendPaymentConfirmationEmail({
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            totalPrice: order.totalPrice,
            paymentMethod: order.paymentMethod,
            items,
          }).catch((err) => {
            console.error("[Orders] Error enviant confirmació de pagament:", err);
            return false;
          });
        }

        // Enviar correu de comanda llista per recollir si la comanda passa a entregada
        if (input.isDelivered === 1 && order && order.isDelivered === 0 && order.customerEmail) {
          // Obtenir les dades del punt de recollida
          let pickupPointName = "Punt de recollida";
          let pickupPointAddress = "";
          let pickupPointCity = "";
          let pickupPointPhone = "";

          if (order.pickupPointId) {
            const allPickupPoints = await getApprovedPickupPoints();
            const pickupPoint = allPickupPoints.find((p: any) => p.id === order.pickupPointId);
            if (pickupPoint) {
              pickupPointName = pickupPoint.name;
              pickupPointAddress = pickupPoint.address || "";
              pickupPointCity = pickupPoint.city || "";
              pickupPointPhone = pickupPoint.phone || "";
            }
          }

          // Enviar correu de comanda llista per recollir
          const emailSent = await sendOrderReadyEmail({
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            pickupPointName,
            pickupPointAddress,
            pickupPointCity,
            pickupPointPhone: pickupPointPhone || undefined,
            notes: order.notes || undefined,
          }).catch((err) => {
            console.error("[Orders] Error enviant notificació de comanda llista:", err);
            return false;
          });
          // Marcar que el correu d'entrega ha estat enviat
          if (emailSent) {
            await updateOrderStatus(id, { deliveryEmailSent: 1 });
          }
        }

        return { success: true };
      }),

    // Admin: eliminar una comanda
    delete: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteOrder(input.id);
        return { success: true };
      }),

    // Admin: enviar recordatori de pagament a un client
    sendPaymentReminder: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const allOrders = await getAllOrders();
        const order = allOrders.find((o: { id: number }) => o.id === input.id);

        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Comanda no trobada" });
        }
        if (order.isPaid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Aquesta comanda ja est\u00e0 pagada" });
        }
        if (order.paymentMethod !== "transferencia") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nom\u00e9s s'envia recordatori a comandes per transfer\u00e8ncia" });
        }
        if (!order.customerEmail) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "La comanda no t\u00e9 email de contacte" });
        }

        const items = JSON.parse(order.itemsJson || "[]") as Array<{
          name: string;
          size: string;
          quantity: number;
          price: number;
        }>;

        const sent = await sendPaymentReminderEmail({
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalPrice: order.totalPrice,
          items,
        });

        if (!sent) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No s'ha pogut enviar el recordatori" });
        }

        // Guardar la data d'enviament a la BD
        await updateOrderStatus(input.id, { paymentReminderSentAt: new Date() });

        return { success: true };
      }),

    // Admin: exportar totes les comandes com a CSV
    exportCSV: adminProcedure.query(async () => {
      const orders = await getAllOrders();

      const escape = (val: string | number | null | undefined): string => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        // Escapar cometes dobles i embolicar en cometes si conté comes, salts de línia o cometes
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const headers = [
        "ID",
        "Data",
        "Nom client",
        "Tel\u00e8fon",
        "Email",
        "Productes",
        "Total (\u20ac)",
        "Forma de pagament",
        "Pagat",
        "Entregat",
        "Notes client",
        "Notes internes",
        "Correu entrega enviat",
      ];

      const paymentLabels: Record<string, string> = {
        transferencia: "Transfer\u00e8ncia",
        "enm\u00e0": "En m\u00e0",
      };

      const rows = orders.map((o: {
        id: number;
        createdAt: Date;
        customerName: string;
        customerPhone: string;
        customerEmail: string;
        itemsJson: string;
        totalPrice: number;
        paymentMethod: string;
        isPaid: number;
        isDelivered: number;
        notes: string | null;
        adminNotes: string | null;
        deliveryEmailSent: number;
      }) => {
        const items = JSON.parse(o.itemsJson || "[]") as Array<{
          name: string;
          size: string;
          quantity: number;
          price: number;
        }>;
        const productsStr = items
          .map((i) => `${i.name} T.${i.size} x${i.quantity}`)
          .join(" | ");
        const date = new Date(o.createdAt).toLocaleDateString("ca-ES", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
        return [
          escape(o.id),
          escape(date),
          escape(o.customerName),
          escape(o.customerPhone),
          escape(o.customerEmail),
          escape(productsStr),
          escape(o.totalPrice),
          escape(paymentLabels[o.paymentMethod] ?? o.paymentMethod),
          escape(o.isPaid ? "S\u00ed" : "No"),
          escape(o.isDelivered ? "S\u00ed" : "No"),
          escape(o.notes),
          escape(o.adminNotes),
          escape(o.deliveryEmailSent ? "S\u00ed" : "No"),
        ].join(",");
      });

      // BOM UTF-8 per a compatibilitat amb Excel
      const bom = "\uFEFF";
      const csv = bom + [headers.join(","), ...rows].join("\n");
      return { csv };
    }),

    // User: get their own orders
    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      const allOrders = await getAllOrders();
      return allOrders.filter((o: any) => o.customerEmail === ctx.user.email);
    }),

    // User: get a specific order
    getOrder: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ ctx, input }) => {
        const allOrders = await getAllOrders();
        const order = allOrders.find((o: any) => o.id === input.id);
        if (!order || order.customerEmail !== ctx.user.email) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Comanda no trobada" });
        }
        return order;
      }),

    // Admin: get analytics data
    getAnalytics: adminProcedure.query(async () => {
      const allOrders = await getAllOrders();

      // Calcular estadístiques generals
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
      const paidOrders = allOrders.filter((o: any) => o.isPaid === 1);
      const paidRevenue = paidOrders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);
      const pendingOrders = allOrders.filter((o: any) => o.isPaid === 0);
      const pendingRevenue = pendingOrders.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0);

      // Calcular ingressos per forma de pagament
      const revenueByPaymentMethod: Record<string, number> = {};
      allOrders.forEach((o: any) => {
        const method = o.paymentMethod || "unknown";
        revenueByPaymentMethod[method] = (revenueByPaymentMethod[method] || 0) + (o.totalPrice || 0);
      });

      // Calcular productes més venuts
      const productSales: Record<string, { quantity: number; revenue: number }> = {};
      allOrders.forEach((o: any) => {
        try {
          const items = JSON.parse(o.itemsJson || "[]");
          items.forEach((item: any) => {
            const key = item.name;
            if (!productSales[key]) {
              productSales[key] = { quantity: 0, revenue: 0 };
            }
            productSales[key].quantity += item.quantity || 0;
            productSales[key].revenue += (item.price || 0) * (item.quantity || 0);
          });
        } catch (e) {
          console.error("Error parsing items:", e);
        }
      });

      // Ordenar productes per vendes
      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Calcular tendència de vendes per setmana
      const weeklySales: Record<string, number> = {};
      allOrders.forEach((o: any) => {
        if (o.createdAt) {
          const date = new Date(o.createdAt);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split("T")[0];
          weeklySales[weekKey] = (weeklySales[weekKey] || 0) + (o.totalPrice || 0);
        }
      });

      // Ordenar per data
      const weeklySalesSorted = Object.entries(weeklySales)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([week, revenue]) => ({ week, revenue }));

      return {
        totalOrders,
        totalRevenue,
        paidOrders: paidOrders.length,
        paidRevenue,
        pendingOrders: pendingOrders.length,
        pendingRevenue,
        deliveredOrders: allOrders.filter((o: any) => o.isDelivered === 1).length,
        revenueByPaymentMethod,
        topProducts,
        weeklySales: weeklySalesSorted,
      };
    }),
  }),
  // ── Contacte ──────────────────────────────────────────────────
  contact: router({
    send: publicProcedure
      .input(
        z.object({
          nom: z.string().min(2).max(100),
          email: z.string().email(),
          motiu: z.string().min(1).max(100),
          missatge: z.string().min(10).max(2000),
        })
      )
      .mutation(async ({ input }) => {
        const sent = await sendContactEmail(input);
        if (!sent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No s'ha pogut enviar el missatge. Si us plau, intenta-ho de nou.",
          });
        }
        // Notificar al propietari
        await notifyOwner({
          title: `Nou missatge de contacte: ${input.motiu}`,
          content: `De: ${input.nom} (${input.email})\n\n${input.missatge}`,
        });
        return { success: true };
      }),
  }),

  reviews: router({
    // Públic: llistar ressenyes aprovades
    listApproved: publicProcedure.query(async () => {
      return getApprovedReviews();
    }),

    // Públic: enviar una nova ressenya (queda pendent de moderació)
    submit: publicProcedure
      .input(
        z.object({
          authorName: z.string().min(2).max(128),
          location: z.string().max(128).optional(),
          rating: z.number().int().min(1).max(5).default(5),
          content: z.string().min(10).max(2000),
        })
      )
      .mutation(async ({ input }) => {
        await createReview({
          authorName: input.authorName,
          location: input.location ?? null,
          rating: input.rating,
          content: input.content,
          status: "pending",
        });
        // Notificar al propietari que hi ha una nova ressenya pendent
        await notifyOwner({
          title: "Nova ressenya pendent de moderació",
          content: `${input.authorName} ha enviat una ressenya: "${input.content.slice(0, 100)}..."`,
        }).catch(() => {}); // No bloquejar si falla la notificació
        return { success: true };
      }),

    // Admin: llistar totes les ressenyes (inclou pendents i rebutjades)
    listAll: adminProcedure.query(async () => {
      return getAllReviews();
    }),

    // Admin: aprovar o rebutjar una ressenya
    moderate: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["approved", "rejected", "pending"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateReviewStatus(input.id, input.status);
        return { success: true };
      }),

    // Admin: eliminar una ressenya
    delete: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteReview(input.id);
        return { success: true };
      }),
   }),

  // ── Punts de recollida ──────────────────────────────────────
  pickupPoints: router({
    // Públic: registrar un nou punt de recollida
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(2).max(128),
          type: z.enum(["entitat", "associacio", "botiga", "altra"]),
          address: z.string().min(5).max(256),
          city: z.string().min(2).max(128),
          postalCode: z.string().min(3).max(10),
          phone: z.string().min(6).max(30),
          email: z.string().email(),
          contactPerson: z.string().min(2).max(128),
          description: z.string().max(500).optional(),
          website: z.string().url().optional(),
          openingHours: z.string().max(256).optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Geocode the address to get coordinates
        let latitude: string | null = null;
        let longitude: string | null = null;
        
        try {
          const fullAddress = `${input.address}, ${input.city}, ${input.postalCode}, Spain`;
          const geocodeResult = await geocodeAddressWithFallback(
            fullAddress,
            input.city,
            input.postalCode
          );
          latitude = geocodeResult.lat.toString();
          longitude = geocodeResult.lng.toString();
          console.log(`✅ Geocoded ${input.name}: ${latitude}, ${longitude}`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`❌ Geocoding failed for ${input.name}: ${errorMsg}`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `No s'ha pogut geocodificar l'adreça. ${errorMsg}. Verifica que l'adreça sigui correcta.`,
          });
        }
        
        await createPickupPoint({
          name: input.name,
          type: input.type,
          address: input.address,
          city: input.city,
          postalCode: input.postalCode,
          phone: input.phone,
          email: input.email,
          contactPerson: input.contactPerson,
          description: input.description ?? null,
          website: input.website ?? null,
          openingHours: input.openingHours ?? null,
          latitude,
          longitude,
          status: "pending",
        });
        // Notificar al propietari que hi ha un nou punt de recollida pendent
        await notifyOwner({
          title: `Nou punt de recollida pendent: ${input.name}`,
          content: `${input.contactPerson} ha registrat ${input.name} (${input.type}) a ${input.city}.\n\nTelèfon: ${input.phone}\nEmail: ${input.email}`,
        }).catch(() => {});
        return { success: true };
      }),
    // Públic: llistar punts de recollida aprovats
    listApproved: publicProcedure.query(async () => {
      return getApprovedPickupPoints();
    }),
    // Admin: llistar tots els punts de recollida (inclou pendents i rebutjats)
    listAll: adminProcedure.query(async () => {
      return getAllPickupPoints();
    }),
    // Admin: aprovar o rebutjar un punt de recollida
    moderate: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["approved", "rejected", "pending"]),
        })
      )
      .mutation(async ({ input }) => {
        await updatePickupPointStatus(input.id, input.status);
        return { success: true };
      }),
    // Admin: eliminar un punt de recollida
    delete: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await deletePickupPoint(input.id);
        return { success: true };
      }),
  }),

  // ── Ressenyes de tallers i xerrades ────────────────────────────
  workshopReviews: router({
    // Públic: llistar ressenyes de tallers aprovades
    listApproved: publicProcedure.query(async () => {
      return getApprovedWorkshopReviews();
    }),

    // Públic: enviar una nova ressenya de taller (queda pendent de moderació)
    submit: publicProcedure
      .input(
        z.object({
          authorName: z.string().min(2).max(128),
          email: z.string().email().optional(),
          eventType: z.enum(["taller", "xerrada", "presentacio", "altra"]),
          eventTitle: z.string().min(2).max(256).optional(),
          rating: z.number().int().min(1).max(5).default(5),
          content: z.string().min(10).max(2000),
        })
      )
      .mutation(async ({ input }) => {
        await createWorkshopReview({
          authorName: input.authorName,
          email: input.email ?? null,
          eventType: input.eventType,
          eventTitle: input.eventTitle ?? null,
          rating: input.rating,
          content: input.content,
          status: "pending",
        });
        // Notificar al propietari que hi ha una nova ressenya pendent
        const eventInfo = input.eventTitle ? `sobre "${input.eventTitle}"` : '';
        await notifyOwner({
          title: "Nova ressenya de taller pendent de moderació",
          content: `${input.authorName} ha enviat una ressenya ${eventInfo}: "${input.content.slice(0, 100)}..."`,
        }).catch(() => {}); // No bloquejar si falla la notificació
        return { success: true };
      }),

    // Admin: llistar totes les ressenyes de tallers (inclou pendents i rebutjades)
    listAll: adminProcedure.query(async () => {
      return getAllWorkshopReviews();
    }),

    // Admin: aprovar o rebutjar una ressenya de taller
    moderate: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          status: z.enum(["approved", "rejected", "pending"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateWorkshopReviewStatus(input.id, input.status);
        return { success: true };
      }),

    // Admin: eliminar una ressenya de taller
    delete: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteWorkshopReview(input.id);
        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;
