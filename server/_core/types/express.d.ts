// Express type augmentation for authenticated requests
// The user property is set by Supabase Auth middleware (server/_core/auth.ts)
// or tRPC context (server/_core/context.ts)
import type { AuthUser } from "../_core/context";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}