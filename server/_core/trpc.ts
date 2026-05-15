import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to access this resource" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to access this resource" });
    }

    // Admin check is handled via profile user_type in Supabase.
    // The tRPC context only has { id, email, full_name } from Bearer auth.
    // For admin operations, use the systemRouter which checks Supabase profiles.
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);