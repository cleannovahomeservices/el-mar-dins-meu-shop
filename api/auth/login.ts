import type { IncomingMessage, ServerResponse } from "http";
import { SignJWT } from "jose";

const COOKIE_NAME = "app_session_id";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

function getBody(req: IncomingMessage): Promise<{ email?: string; password?: string }> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); }
      catch { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const { email, password } = await getBody(req);

  const adminSecret = process.env.ADMIN_SECRET ?? "";
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map(e => e.trim()).filter(Boolean);

  if (!password || password !== adminSecret) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Contrasenya incorrecta" }));
    return;
  }

  const normalizedEmail = (email ?? "").trim().toLowerCase();
  if (!normalizedEmail || !adminEmails.includes(normalizedEmail)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: "Aquest correu no té permisos d'administrador" }));
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET ?? "";
    const secretKey = new TextEncoder().encode(jwtSecret);
    const openId = `admin_${normalizedEmail}`;
    const appId = process.env.VITE_APP_ID ?? "elmardinsmeu";
    const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);

    const token = await new SignJWT({ openId, appId, name: normalizedEmail })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);

    // Best-effort: save user to DB
    try { await upsertAdminUser(normalizedEmail, openId); } catch {}

    const maxAge = Math.floor(ONE_YEAR_MS / 1000);
    res.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${maxAge}`);
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true }));
  } catch (err) {
    console.error("[Login] Error:", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Error intern del servidor" }));
  }
}

async function upsertAdminUser(email: string, openId: string) {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const mysql = await import("mysql2/promise");
  const { drizzle } = await import("drizzle-orm/mysql2");
  const { users } = await import("../../drizzle/schema");
  const pool = mysql.createPool({ uri: url, ssl: { rejectUnauthorized: false }, connectionLimit: 1 });
  const db = drizzle(pool);
  await db.insert(users).values({
    openId, name: email, email, loginMethod: "admin", role: "admin", lastSignedIn: new Date(),
  }).onDuplicateKeyUpdate({ set: { lastSignedIn: new Date(), role: "admin" } });
  await pool.end();
}
