import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "http";

let importError: unknown = null;
let cachedApp: unknown = null;

async function getApp() {
  if (cachedApp || importError) return;
  try {
    const mod = await import("../server/_core/app");
    cachedApp = mod.createApp();
  } catch (err) {
    importError = err;
    console.error("[api/[...path]] Dynamic import error:", err);
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");

  const url = (req as any).url || "";
  if (url === "/api/__diag" || url.startsWith("/api/__diag?")) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      ok: true,
      node: process.version,
      env: {
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasJwtSecret: Boolean(process.env.JWT_SECRET),
        hasAdminSecret: Boolean(process.env.ADMIN_SECRET),
        adminEmails: process.env.ADMIN_EMAILS ?? null,
        viteAppId: process.env.VITE_APP_ID ?? null,
      },
    }));
    return;
  }

  await getApp();

  if (importError) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Import failed",
      message: importError instanceof Error ? importError.message : String(importError),
      stack: importError instanceof Error ? importError.stack?.split("\n").slice(0, 12) : undefined,
    }));
    return;
  }

  try {
    (cachedApp as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
  } catch (err) {
    console.error("[api/[...path]] Handler error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: "Handler threw",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 12) : undefined,
    }));
  }
}
