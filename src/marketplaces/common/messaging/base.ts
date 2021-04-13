import type {
  AppMessage,
  AppMessageDescription,
  ErrorMessage,
} from "src/marketplaces/messaging";

export type MessageFromDescription<
  D extends AppMessageDescription<string, any>
> = D extends AppMessageDescription<infer T, infer Data>
  ? AppMessage<T, Data>
  : never;

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
