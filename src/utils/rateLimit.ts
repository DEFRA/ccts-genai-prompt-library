interface RateLimiter {
  checkLimit: () => Promise<void>;
}

interface RequestLog {
  timestamp: number;
}

export const rateLimit = (
  maxRequests: number,
  timeWindow: number
): RateLimiter => {
  const requests: RequestLog[] = [];

  const cleanup = () => {
    const now = Date.now();
    const windowStart = now - timeWindow;
    while (requests.length > 0 && requests[0].timestamp < windowStart) {
      requests.shift();
    }
  };

  return {
    checkLimit: () => {
      return new Promise((resolve, reject) => {
        cleanup();

        if (requests.length >= maxRequests) {
          const oldestRequest = requests[0].timestamp;
          const nextAvailable = oldestRequest + timeWindow;
          const waitTime = nextAvailable - Date.now();
          reject(
            new Error(
              `Rate limit exceeded. Please wait ${Math.ceil(
                waitTime / 1000
              )} seconds.`
            )
          );
          return;
        }

        requests.push({ timestamp: Date.now() });
        resolve();
      });
    },
  };
};
