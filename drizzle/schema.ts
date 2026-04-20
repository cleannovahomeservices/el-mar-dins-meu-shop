import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Taula de ressenyes del llibre
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  /** Nom del ressenyador (no requereix login) */
  authorName: varchar("authorName", { length: 128 }).notNull(),
  /** Localitat opcional */
  location: varchar("location", { length: 128 }),
  /** Valoració de 1 a 5 */
  rating: int("rating").notNull().default(5),
  /** Text de la ressenya */
  content: text("content").notNull(),
  /** Estat: pending (pendent de moderació), approved (publicada), rejected (rebutjada) */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// Taula de comandes
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  /** Nom del client */
  customerName: varchar("customerName", { length: 128 }).notNull(),
  /** Telèfon del client */
  customerPhone: varchar("customerPhone", { length: 30 }).notNull(),
  /** Email del client */
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  /** Notes addicionals */
  notes: text("notes"),
  /** Forma de pagament */
  paymentMethod: mysqlEnum("paymentMethod", ["transferencia", "enmà", "stripe"]).notNull(),
  /** Total de la comanda en euros */
  totalPrice: int("totalPrice").notNull(),
  /** Productes en format JSON: [{name, size, quantity, price}] */
  itemsJson: text("itemsJson").notNull(),
  /** Punt de recollida seleccionat (opcional) */
  pickupPointId: int("pickupPointId"),
  /** Estat del pagament */
  isPaid: int("isPaid").default(0).notNull(),
  /** Estat de l'entrega */
  isDelivered: int("isDelivered").default(0).notNull(),
  /** Notes internes de l'administrador */
  adminNotes: text("adminNotes"),
  /** Indica si s'ha enviat el correu de confirmació d'entrega al client */
  deliveryEmailSent: int("deliveryEmailSent").default(0).notNull(),
  /** Data i hora en què s'ha enviat l'últim recordatori de pagament */
  paymentReminderSentAt: timestamp("paymentReminderSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Taula de pagaments amb Stripe
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  /** ID de la comanda relacionada */
  orderId: int("orderId").notNull(),
  /** Stripe Payment Intent ID */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 256 }).notNull().unique(),
  /** Stripe Customer ID */
  stripeCustomerId: varchar("stripeCustomerId", { length: 256 }),
  /** Stripe Checkout Session ID */
  stripeSessionId: varchar("stripeSessionId", { length: 256 }),
  /** Estat del pagament: pending, succeeded, failed, canceled */
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "canceled"]).default("pending").notNull(),
  /** Quantitat en cèntims */
  amount: int("amount").notNull(),
  /** Moneda */
  currency: varchar("currency", { length: 3 }).default("eur").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Taula de punts de recollida
export const pickupPoints = mysqlTable("pickupPoints", {
  id: int("id").autoincrement().primaryKey(),
  /** Nom de l'entitat/botiga/associació */
  name: varchar("name", { length: 256 }).notNull(),
  /** Tipus: "entitat", "associacio", "botiga", "altre" */
  type: mysqlEnum("type", ["entitat", "associacio", "botiga", "altra"]).notNull(),
  /** Adreça completa */
  address: text("address").notNull(),
  /** Ciutat */
  city: varchar("city", { length: 128 }).notNull(),
  /** Codi postal */
  postalCode: varchar("postalCode", { length: 10 }).notNull(),
  /** Telèfon de contacte */
  phone: varchar("phone", { length: 30 }).notNull(),
  /** Email de contacte */
  email: varchar("email", { length: 320 }).notNull(),
  /** Persona de contacte */
  contactPerson: varchar("contactPerson", { length: 128 }).notNull(),
  /** Descripció breu */
  description: text("description"),
  /** URL del web (opcional) */
  website: varchar("website", { length: 512 }),
  /** Horari d'atenció (opcional) */
  openingHours: text("openingHours"),
  /** Latitud per a mapa (opcional) */
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  /** Longitud per a mapa (opcional) */
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  /** Estat: pending (pendent d'aprovació), approved (aprovat), rejected (rebutjat) */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  /** Notes internes de l'administrador */
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PickupPoint = typeof pickupPoints.$inferSelect;
export type InsertPickupPoint = typeof pickupPoints.$inferInsert;

// Taula de ressenyes de tallers i xerrades
export const workshopReviews = mysqlTable("workshopReviews", {
  id: int("id").autoincrement().primaryKey(),
  /** Nom de la persona que deixa la ressenya (no requereix login) */
  authorName: varchar("authorName", { length: 128 }).notNull(),
  /** Email opcional per a contacte */
  email: varchar("email", { length: 320 }),
  /** Tipus d'event: "taller", "xerrada", "presentacio", "altre" */
  eventType: mysqlEnum("eventType", ["taller", "xerrada", "presentacio", "altra"]).notNull(),
  /** Títol o descripció breu de l'event */
  eventTitle: varchar("eventTitle", { length: 256 }),
  /** Valoració de 1 a 5 */
  rating: int("rating").notNull().default(5),
  /** Text de la ressenya */
  content: text("content").notNull(),
  /** Estat: pending (pendent de moderació), approved (publicada), rejected (rebutjada) */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkshopReview = typeof workshopReviews.$inferSelect;
export type InsertWorkshopReview = typeof workshopReviews.$inferInsert;
