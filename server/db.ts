import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, InsertReview, InsertOrder, users, reviews, orders } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 5,
        connectTimeout: 10000,
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ── Ressenyes ────────────────────────────────────────────────

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reviews).values(data);
  return result;
}

export async function getApprovedReviews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.status, "approved")).orderBy(desc(reviews.createdAt));
}

export async function getAllReviews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function updateReviewStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(reviews).set({ status }).where(eq(reviews.id, id));
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(reviews).where(eq(reviews.id, id));
}

// ── Comandes ────────────────────────────────────────────

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(
  id: number,
  data: { isPaid?: number; isDelivered?: number; adminNotes?: string; deliveryEmailSent?: number; paymentReminderSentAt?: Date | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set(data).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(orders).where(eq(orders.id, id));
}

// ── Punts de recollida ────────────────────────────────────────

import { pickupPoints, workshopReviews, InsertWorkshopReview, InsertPickupPoint } from "../drizzle/schema";

export async function createPickupPoint(data: InsertPickupPoint) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(pickupPoints).values(data);
  // Fetch the created pickup point to return it with ID
  const created = await db.select().from(pickupPoints)
    .where(eq(pickupPoints.email, data.email))
    .orderBy(desc(pickupPoints.createdAt))
    .limit(1);
  return created[0];
}

export async function getApprovedPickupPoints() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pickupPoints).where(eq(pickupPoints.status, "approved")).orderBy(desc(pickupPoints.createdAt));
}

export async function getAllPickupPoints() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pickupPoints).orderBy(desc(pickupPoints.createdAt));
}

export async function updatePickupPointStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(pickupPoints).set({ status }).where(eq(pickupPoints.id, id));
}

export async function deletePickupPoint(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(pickupPoints).where(eq(pickupPoints.id, id));
}

// ── Ressenyes de tallers i xerrades ────────────────────────────────────────

export async function createWorkshopReview(data: InsertWorkshopReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(workshopReviews).values(data);
  // Fetch the created review to return it with ID
  const created = await db.select().from(workshopReviews)
    .where(eq(workshopReviews.authorName, data.authorName))
    .orderBy(desc(workshopReviews.createdAt))
    .limit(1);
  return created[0];
}

export async function getApprovedWorkshopReviews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workshopReviews).where(eq(workshopReviews.status, "approved")).orderBy(desc(workshopReviews.createdAt));
}

export async function getAllWorkshopReviews() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workshopReviews).orderBy(desc(workshopReviews.createdAt));
}

export async function updateWorkshopReviewStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(workshopReviews).set({ status }).where(eq(workshopReviews.id, id));
}

export async function deleteWorkshopReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(workshopReviews).where(eq(workshopReviews.id, id));
}
