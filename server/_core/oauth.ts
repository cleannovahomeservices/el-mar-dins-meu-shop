import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

export function registerOAuthRoutes(app: Express) {
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!password || password !== ENV.adminSecret) {
      res.status(401).json({ error: "Contrasenya incorrecta" });
      return;
    }

    const normalizedEmail = (email ?? "").trim().toLowerCase();
    if (!normalizedEmail || !ENV.adminEmails.includes(normalizedEmail)) {
      res.status(403).json({ error: "Aquest correu no té permisos d'administrador" });
      return;
    }

    try {
      const openId = `admin_${normalizedEmail}`;
      await db.upsertUser({
        openId,
        name: normalizedEmail,
        email: normalizedEmail,
        loginMethod: "admin",
        role: "admin",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(openId, {
        name: normalizedEmail,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Admin login failed", error);
      res.status(500).json({ error: "Error intern del servidor" });
    }
  });
}
