/**
 * API Performance Optimizations
 * 
 * Improvements:
 * 1. Response caching middleware
 * 2. Cache headers for GET requests
 * 3. Response compression ready
 * 4. Batch queries support
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";

// In-memory cache (use Redis in production)
const CACHE = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute default

export function getCache<T>(key: string): T | null {
  const entry = CACHE.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expires) {
    CACHE.delete(key);
    return null;
  }
  
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  CACHE.set(key, {
    data,
    expires: Date.now() + ttl,
  });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    CACHE.clear();
    return;
  }
  
  for (const key of Array.from(CACHE.keys())) {
    if (key.includes(pattern)) {
      CACHE.delete(key);
    }
  }
}

// Cache middleware for tRPC
export function cacheMiddleware(ttlSeconds: number = 60) {
  return (opts: any) => {
    const cacheKey = JSON.stringify({
      path: opts.path,
      input: opts.input,
    });
    
    // Try to get from cache
    const cached = getCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    return opts.next().then((result: any) => {
      setCache(cacheKey, result, ttlSeconds * 1000);
      return result;
    });
  };
}

// Rate limiting (simple in-memory, use Redis in production)
const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = RATE_LIMIT.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// Cache-Control header helper
export function getCacheHeaders(ttlSeconds: number, isPrivate: boolean = true) {
  const cacheControl = isPrivate
    ? `private, max-age=${ttlSeconds}`
    : `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds * 2}`;
  
  return {
    "Cache-Control": cacheControl,
    "CDN-Cache-Control": isPrivate ? "private" : `public, max-age=${ttlSeconds * 2}`,
    "Vary": "Accept-Encoding",
  };
}

// Batch query optimizer
export async function batchQueries<T>(
  queries: Array<() => Promise<T>>,
  batchSize: number = 5
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(q => q()));
    results.push(...batchResults);
  }
  
  return results;
}

// Response size optimizer
export function optimizeResponse<T extends Record<string, any>>(
  data: T,
  options: {
    excludeFields?: string[];
    maxDepth?: number;
  } = {}
): T {
  const { excludeFields = [], maxDepth = 5 } = options;
  
  function prune(obj: any, depth: number = 0): any {
    if (depth > maxDepth || obj === null || obj === undefined) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => prune(item, depth + 1));
    }
    
    if (typeof obj === "object") {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (excludeFields.includes(key)) continue;
        result[key] = prune(value, depth + 1);
      }
      return result;
    }
    
    return obj;
  }
  
  return prune(data);
}
