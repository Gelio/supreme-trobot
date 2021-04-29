import type { AppMessage, ErrorMessage } from "../base";
import type { AppRequestResponsePair } from "./pair";

export type AppRequestResponder<
  ResponsePair extends AppRequestResponsePair<any, any, any, any>
> = ResponsePair extends AppRequestResponsePair<
  infer R1T,
  infer R1D,
  any,
  infer R2D
>
  ? (message: AppMessage<R1T, R1D>) => R2D | Promise<R2D>
  : never;

export const createResponder = <
  R1T extends string,
  R1D,
  R2T extends string,
  R2D
>(
  messagePair: AppRequestResponsePair<R1T, R1D, R2T, R2D>
) => (
  port: chrome.runtime.Port,
  handler: AppRequestResponder<typeof messagePair>
) => async (message: AppMessage<string, unknown>) => {
  if (!messagePair.request.is(message)) {
    return;
  }

  try {
    const responseData = await handler(message);
    const response = messagePair.response.create(responseData);
    port.postMessage(response);
  } catch (error: unknown) {
    const errorMessage: ErrorMessage = {
      type: "error",
      data: error,
    };
    port.postMessage(errorMessage);
  }
};
