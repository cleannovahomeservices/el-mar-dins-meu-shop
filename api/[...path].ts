import "dotenv/config";
import type { IncomingMessage, ServerResponse } from "http";

let cachedApp: unknown = null;
let initError: unknown = null;

try {
  const { createApp } = require("../server/_core/app");
  cachedApp = createApp();
} catch (err) {
  initError = err;
  console.error("[api/[...path]] Init error:", err);
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (initError) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Init failed",
        message: initError instanceof Error ? initError.message : String(initError),
        stack: initError instanceof Error ? initError.stack?.split("\n").slice(0, 10) : undefined,
      })
    );
    return;
  }
  try {
    (cachedApp as (req: IncomingMessage, res: ServerResponse) => void)(req, res);
  } catch (err) {
    console.error("[api/[...path]] Handler error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Handler threw",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack?.split("\n").slice(0, 10) : undefined,
      })
    );
  }
}
