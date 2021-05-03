import type { AppMessage, AppErrorMessage } from "../base";
import type { AppRequestResponsePair } from "./pair";

/** A handler for the request. Must handle the request */
export type AppRequestHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResponsePair extends AppRequestResponsePair<string, any, string, any>
> = ResponsePair extends AppRequestResponsePair<
  infer R1T,
  infer R1D,
  string,
  infer R2D
>
  ? (message: AppMessage<R1T, R1D>) => R2D | Promise<R2D>
  : never;

/** @returns null if the message cannot be handled by this responder */
export type AppRequestResponder = (
  port: chrome.runtime.Port,
  message: AppMessage<string, unknown>
) => null | Promise<void>;

export const createResponder = <
  R1T extends string,
  R1D,
  R2T extends string,
  R2D
>(
  messagePair: AppRequestResponsePair<R1T, R1D, R2T, R2D>,
  handler: AppRequestHandler<typeof messagePair>
): AppRequestResponder => (port, message) => {
  if (!messagePair.request.is(message)) {
    return null;
  }

  // Create an initial promise to promisify the `handler`'s return type
  return Promise.resolve()
    .then(() => handler(message))
    .then((responseData) => {
      const response = messagePair.response.create(responseData);
      port.postMessage(response);
    })
    .catch((error) => {
      const errorMessage: AppErrorMessage = {
        type: "ERROR",
        data: error,
      };
      port.postMessage(errorMessage);
    });
};

export const combineResponders = (
  ...responders: AppRequestResponder[]
): AppRequestResponder => (port, message) => {
  for (const respond of responders) {
    const respondResult = respond(port, message);
    if (respondResult) {
      return respondResult;
    }
  }

  return null;
};
