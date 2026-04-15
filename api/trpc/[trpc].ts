/**
 * tRPC API — Vercel Serverless Function (catch-all)
 * Uses @trpc/server fetch adapter for Vercel Node.js runtime
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import type { TrpcContext } from "../../server/_core/context";
import type { User } from "../../server/db";

// Minimal createContext for serverless (no Express req/res)
async function createContext(opts: { req: Request }): Promise<TrpcContext> {
  return {
    req: opts.req as any,
    res: {} as any,
    user: null as User | null,
  };
}

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ req }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`❌ tRPC failed on ${path ?? "<no-path>"}:`, error);
          }
        : undefined,
  });
}

export const config = { runtime: "edge" };
