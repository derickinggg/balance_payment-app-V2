import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "ioredis";

let limiter: Ratelimit | null = null;

export function getRateLimiter() {
  if (limiter) return limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    limiter = new Ratelimit({
      redis: new Redis(url, { password: token }),
      limiter: Ratelimit.fixedWindow(5, "1 m"),
      analytics: false,
    });
  }
  return limiter;
}


