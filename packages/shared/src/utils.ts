/**
 * Retries a given operation multiple times with an optional delay between attempts.
 * @param operation The async function to retry
 * @param maxAttempts The maximum number of attempts (default: 3)
 * @param delay The delay between attempts in milliseconds (default: 1000)
 * @returns A promise that resolves with the operation result or rejects if all attempts fail
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Operation failed after ${maxAttempts} attempts. Last error: ${lastError?.message}`,
  );
}

// Example usage:
// const result = await retry(async () => {
//   // Your async operation here
// }, 5, 2000);
