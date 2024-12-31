class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isLimited(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Remove expired timestamps
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return true;
    }

    validRequests.push(now);
    this.requests.set(userId, validRequests);
    return false;
  }
}

export const rateLimiter = new RateLimiter(15 * 60 * 1000, 100); // 15 minutes, 100 requests
