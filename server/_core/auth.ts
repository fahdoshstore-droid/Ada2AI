/**
 * Supabase Auth Middleware + Rate Limiter for Ada2AI Server
 *
 * - Supabase JWT verification for protected API routes
 * - In-memory rate limiting for Claude API calls
 * - File upload size validation
 */

import { createClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction } from "express";

// ── Supabase Client ────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// ── Auth Middleware ─────────────────────────────────────────────────
/**
 * Express middleware that verifies Supabase JWT tokens.
 * Extracts Bearer token from Authorization header, verifies with Supabase,
 * and attaches user info to req.user.
 *
 * If SUPABASE_URL/SUPABASE_ANON_KEY are not configured, the middleware
 * logs a warning and passes through (for development).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Strict auth - no bypass, require Supabase credentials to be configured
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: "Auth service not configured" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.slice(7);

  // SEC-11: Removed ANON_KEY as valid auth token - security risk
  // ANON_KEY is a public key that should not be used for service authentication

  const supabase = getSupabaseClient();
  if (!supabase) {
    console.error("[Auth] Supabase client not initialized");
    return res.status(500).json({ error: "Auth service unavailable" });
  }

  // Verify JWT token with Supabase
  supabase.auth
    .getUser(token)
    .then(({ data, error }) => {
      if (error || !data.user) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      (req as any).user = {
        id: data.user.id,
        email: data.user.email,
      };
      next();
    })
    .catch((err) => {
      console.error("[Auth] Token verification failed:", err);
      return res.status(401).json({ error: "Token verification failed" });
    });
}

// ── Rate Limiter ────────────────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;   // 20 Claude calls per minute per user

/**
 * In-memory rate limiter for Claude API-involved endpoints.
 * Limits per-user (by user ID or IP) requests within a time window.
 */
export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user?.id || req.ip || "anonymous";
  const now = Date.now();

  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    return res
      .status(429)
      .json({ error: "Rate limit exceeded", retryAfterSeconds: retryAfter });
  }

  entry.count++;
  next();
}

// ── File Upload Size Limiter ───────────────────────────────────────
const MAX_UPLOAD_SIZE_MB = 50;
const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

/**
 * Validates file upload size from the request body.
 * Works with base64-encoded file data in JSON body.
 */
export function validateUploadSize(req: Request, res: Response, next: NextFunction) {
  // Check Content-Length header first
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength > MAX_UPLOAD_SIZE_BYTES) {
    return res.status(413).json({
      error: `File too large. Maximum size is ${MAX_UPLOAD_SIZE_MB}MB`,
    });
  }

  // For base64 file uploads in /api/scout/upload, check fileData size
  if (req.body?.fileData) {
    const sizeBytes = Math.ceil((req.body.fileData.length * 3) / 4); // base64 → bytes
    if (sizeBytes > MAX_UPLOAD_SIZE_BYTES) {
      return res.status(413).json({
        error: `File too large (${(sizeBytes / 1024 / 1024).toFixed(1)}MB). Maximum is ${MAX_UPLOAD_SIZE_MB}MB`,
      });
    }
  }

  next();
}

// Cleanup rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitMap.entries())) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60_000);
