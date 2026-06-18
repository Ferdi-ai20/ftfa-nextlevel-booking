export class QueryTimeoutError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`${label} timed out after ${timeoutMs}ms`);
    this.name = "QueryTimeoutError";
  }
}

export const withTimeout = async <T,>(operation: PromiseLike<T>, timeoutMs: number, label: string): Promise<T> => {
  let timeoutId: number | undefined;

  try {
    return await Promise.race([
      Promise.resolve(operation),
      new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new QueryTimeoutError(label, timeoutMs)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
};

export const timedWithTimeout = async <T,>(label: string, operation: PromiseLike<T>, timeoutMs: number): Promise<T> => {
  const startedAt = performance.now();
  console.time(label);
  try {
    return await withTimeout(operation, timeoutMs, label);
  } finally {
    const duration = Math.round(performance.now() - startedAt);
    console.timeEnd(label);
    console.info(`${label} -> ${duration}ms`);
  }
};