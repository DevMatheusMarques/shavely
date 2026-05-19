import { sleep } from "../../infrastructure/util/sleep.js";

const DEFAULT_BACKOFF_MS = [1000, 2000, 4000, 8000, 16000];

export async function runWithBackoff<T>(
  fn: () => Promise<T>,
  backoffs: number[] = DEFAULT_BACKOFF_MS,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= backoffs.length; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const delay = backoffs[i];
      if (delay === undefined) {
        break;
      }
      await sleep(delay);
    }
  }
  throw lastError;
}
