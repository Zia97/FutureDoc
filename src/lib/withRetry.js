const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async function with exponential backoff.
 * @param {() => Promise<T>} fn - The async function to retry.
 * @param {{ maxAttempts?: number, shouldRetry?: (result: T) => boolean }} options
 */
export async function withRetry(fn, { maxAttempts = MAX_ATTEMPTS, shouldRetry } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await fn();

      if (shouldRetry?.(result)) {
        lastError = new Error('Received empty result from server');
        if (attempt < maxAttempts) {
          await delay(BASE_DELAY_MS * Math.pow(2, attempt - 1));
        }
        continue;
      }

      return result;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await delay(BASE_DELAY_MS * Math.pow(2, attempt - 1));
      }
    }
  }

  throw lastError;
}
