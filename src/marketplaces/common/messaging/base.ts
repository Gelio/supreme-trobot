export interface AppMessage<T extends string = string, Data = unknown> {
  type: T;
  data: Data;
}

export type ErrorMessage<E = unknown> = AppMessage<"error", E>;

// NOTE: checking equality with `never` is troublesome.
// See https://github.com/microsoft/TypeScript/issues/23182#issuecomment-379091887
export type AppMessageFactory<T extends string, Data> = [Data] extends [never]
  ? () => AppMessage<T, Data>
  : (data: Data) => AppMessage<T, Data>;

export interface AppMessageDescription<T extends string, Data> {
  type: T;
  make: AppMessageFactory<T, Data>;
  is: (message: AppMessage) => message is AppMessage<T, Data>;
}

export const createMessageDescription = <
  Data = unknown,
  T extends string = string
>(
  type: T
): AppMessageDescription<T, Data> => ({
  make: ((data) => ({
    type,
    data,
  })) as AppMessageFactory<T, Data>,
  type,
  is: (message): message is AppMessage<T, Data> => message.type === type,
});

export interface AppMessagePair<
  R1T extends string,
  R1D,
  R2T extends string,
  R2D
> {
  request: AppMessageDescription<R1T, R1D>;
  response: AppMessageDescription<R2T, R2D>;
}

export const createAppMessagePair = <
  R1T extends string,
  R1D,
  R2T extends string,
  R2D
>(
  pair: AppMessagePair<R1T, R1D, R2T, R2D>
) => pair;

export const createResponder = <
  R1T extends string,
  R1D,
  R2T extends string,
  R2D
>(
  port: chrome.runtime.Port,
  messagePair: AppMessagePair<R1T, R1D, R2T, R2D>,
  handler: (message: AppMessage<R1T, R1D>) => R2D | Promise<R2D>
) => async (message: AppMessage<string, unknown>) => {
  if (!messagePair.request.is(message)) {
    return;
  }

  try {
    const responseData = await handler(message);
    const response = messagePair.response.make(responseData);
    port.postMessage(response);
  } catch (error: unknown) {
    const errorMessage: ErrorMessage = {
      type: "error",
      data: error,
    };
    port.postMessage(errorMessage);
  }
};
