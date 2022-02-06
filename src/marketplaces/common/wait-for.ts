interface WaitForOptions {
  retriesCount?: number;
  delay?: number;
}

const DEFAULT_RETRIES_COUNT = 3;
const DEFAULT_DELAY = 1000;

/**
 * Runs the function until it succeeds, with timeouts in between, until a
 * specific retries number is achieved.
 *
 * The fn assumes to have succeeded if it returns a truthy value.
 */
export const waitFor = async <Ret>(
  fn: () => Promise<Ret>,
  {
    delay = DEFAULT_DELAY,
    retriesCount = DEFAULT_RETRIES_COUNT,
  }: WaitForOptions = {}
): Promise<NonNullable<Ret>> => {
  let retriesLeft = retriesCount;

  const intermediateResults: unknown[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await fn().catch(
      (error) => (console.error("Error when invoking fn", error), false)
    );
    if (result) {
      // NOTE: assertion is safe, because truthiness is verified in this if
      return result as unknown as NonNullable<Ret>;
    }

    intermediateResults.push(result);
    retriesLeft--;
    if (retriesLeft === 0) {
      break;
    }

    console.log(
      `Operation failed. Retrying in 1s. Retries left: ${retriesLeft}`
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  console.error("Operation failed. Intermediate results:", intermediateResults);
  return Promise.reject(new Error("Operation failed"));
};
