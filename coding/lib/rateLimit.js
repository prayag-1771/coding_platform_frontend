const globalStore = globalThis;

if (!globalStore.__apiRateLimitStore) {
  globalStore.__apiRateLimitStore = new Map();
}

const rateLimitStore = globalStore.__apiRateLimitStore;

function getClientIp(req) {
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export function checkRateLimit(req, options) {
  const { keyPrefix, limit, windowMs } = options;

  const now = Date.now();
  const clientIp = getClientIp(req);
  const key = `${keyPrefix}:${clientIp}`;

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetAt) {
    const fresh = {
      count: 1,
      resetAt: now + windowMs,
    };

    rateLimitStore.set(key, fresh);

    return {
      allowed: true,
      remaining: Math.max(limit - 1, 0),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        Math.ceil((current.resetAt - now) / 1000),
        1
      ),
    };
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(limit - current.count, 0),
    retryAfterSeconds: Math.max(
      Math.ceil((current.resetAt - now) / 1000),
      1
    ),
  };
}
