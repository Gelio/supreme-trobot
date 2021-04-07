/**
 * Runs the function until it succeeds, with timeouts in between, until a
 * specific retries number is achieved.
 *
 * The fn assumes to have succeeded if it returns a truthy value.
 */
export const waitFor = async <Ret>(
  fn: () => Promise<Ret>
): Promise<NonNullable<Ret>> => {
  let retriesLeft = 3;
  while (true) {
    const result = await fn().catch(
      (error) => (console.error("Error when invoking fn", error), false)
    );
    if (result) {
      // NOTE: assertion is safe, because truthiness is verified in this if
      return result as NonNullable<Ret>;
    }

    retriesLeft--;
    if (retriesLeft === 0) {
      break;
    }

    console.log(
      `Operation failed. Retrying in 1s. Retries left: ${retriesLeft}`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return Promise.reject(new Error("Operation failed"));
};
