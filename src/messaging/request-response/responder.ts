import type { AppMessage, AppErrorMessage } from "../base";
import type { AppRequestResponsePair } from "./pair";

/** A handler for the request. Must handle the request */
export type AppRequestResponder<
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

export const createResponder = <
  R1T extends string,
  R1D extends unknown,
  R2T extends string,
  R2D extends unknown
>(
  messagePair: AppRequestResponsePair<R1T, R1D, R2T, R2D>
) => (
  port: chrome.runtime.Port,
  handler: AppRequestResponder<typeof messagePair>
  /** @returns nulls if the message cannot be handled */
) => (message: AppMessage<string, unknown>): null | Promise<void> => {
  if (!messagePair.request.is(message)) {
    return null;
  }

  // Use `then` to make get the handler return value into a promise
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
