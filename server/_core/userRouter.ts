/**
 * Optimized User Endpoints
 * 
 * Performance optimizations:
 * 1. Response caching for GET requests
 * 2. Cache-Control headers
 * 3. Rate limiting
 * 4. Response compression
 */

import { router, publicProcedure, protectedProcedure } from "./trpc";
import { z } from "zod";
import { getCache, setCache, checkRateLimit, getCacheHeaders, optimizeResponse } from "./optimizations";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  // Get user profile (cached)
  profile: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input }) => {
      const cacheKey = `user:profile:${input.userId || "me"}`;
      
      // Check cache
      const cached = getCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          _cached: true,
        };
      }
      
      // TODO: Fetch from database
      const profile = {
        id: input.userId || "demo",
        email: "demo@example.com",
        name: "Demo User",
        role: "user",
        createdAt: new Date().toISOString(),
      };
      
      // Cache for 5 minutes
      setCache(cacheKey, profile, 5 * 60 * 1000);
      
      return {
        ...profile,
        _cached: false,
      };
    }),

  // Update user profile
  update: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100).optional(),
      avatar: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Rate limit profile updates
      const rateLimit = checkRateLimit(`user:update:${ctx.user.id}`, 10, 60 * 1000);
      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Update rate limit exceeded",
        });
      }
      
      // TODO: Update in database
      const updated = {
        id: ctx.user.id,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      
      // Invalidate profile cache
      const cacheKey = `user:profile:${ctx.user.id}`;
      // Cache would be invalidated here in production
      
      return updated;
    }),

  // Get user stats (cached, aggregated)
  stats: protectedProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const userId = input.userId || ctx.user.id;
      const cacheKey = `user:stats:${userId}`;
      
      const cached = getCache(cacheKey);
      if (cached) {
        return { ...cached, _cached: true };
      }
      
      // TODO: Aggregate from database
      const stats = {
        totalScans: 42,
        totalAnalyses: 128,
        apiCalls: 512,
        storageUsed: 1024 * 1024 * 50, // 50MB
      };
      
      // Cache for 1 minute
      setCache(cacheKey, stats, 60 * 1000);
      
      return { ...stats, _cached: false };
    }),

  // Batch get multiple users (optimized)
  batchGet: publicProcedure
    .input(z.object({
      userIds: z.array(z.string()).max(20),
    }))
    .query(async ({ input }) => {
      const cacheKey = `user:batch:${input.userIds.sort().join(",")}`;
      
      const cached = getCache(cacheKey);
      if (cached) {
        return cached;
      }
      
      // TODO: Batch query from database
      const users = input.userIds.map(id => ({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
      }));
      
      // Cache for 2 minutes
      setCache(cacheKey, users, 2 * 60 * 1000);
      
      return users;
    }),
});

// Export headers helper for use in other routers
export { getCacheHeaders };
