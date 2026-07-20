const MIN_INTERVAL_MS = 20_000; // ~3 req/min — extra safety margin below Mistral's 4/min cap
const MAX_RETRIES = 4;
const RETRY_BACKOFF_MS = [10_000, 20_000, 40_000, 60_000];

let queue: Promise<void> = Promise.resolve();
let lastCallAt = 0;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ensures at most one call proceeds every MIN_INTERVAL_MS, regardless of how
// many callers invoke this concurrently — they queue up and wait their turn.
async function throttle(): Promise<void> {
  const run = queue.then(async () => {
    const elapsed = Date.now() - lastCallAt;
    if (elapsed < MIN_INTERVAL_MS) {
      await wait(MIN_INTERVAL_MS - elapsed);
    }
    lastCallAt = Date.now();
  });
  queue = run;
  await run;
}

function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("429") ||
    message.toLowerCase().includes("rate limit") ||
    message.toLowerCase().includes("rate_limited")
  );
}

export async function callWithRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await throttle();
    try {
      return await fn();
    } catch (err) {
      if (isRateLimitError(err) && attempt < MAX_RETRIES) {
        const backoff = RETRY_BACKOFF_MS[attempt] ?? 60_000;
        console.warn(
          `Rate limited by model provider (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${backoff / 1000}s...`,
        );
        await wait(backoff);
        continue;
      }
      throw err;
    }
  }
  throw new Error("callWithRateLimit: exhausted retries");
}
