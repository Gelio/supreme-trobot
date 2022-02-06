import { either } from "fp-ts";
import { Observable } from "rxjs";

import type { AppMessage } from "./base";

export type PortMessageResult = either.Either<
  chrome.runtime.LastError,
  AppMessage
>;

export const getPortMessage$ = (port: chrome.runtime.Port) =>
  new Observable<PortMessageResult>((subscriber) => {
    const removeListeners = () => {
      port.onMessage.removeListener(onMessage);
      port.onDisconnect.removeListener(onDisconnect);
    };

    const onMessage = (message: AppMessage) => {
      subscriber.next(either.right(message));
    };
    port.onMessage.addListener(onMessage);

    const onDisconnect = () => {
      removeListeners();
      if (chrome.runtime.lastError) {
        subscriber.next(either.left(chrome.runtime.lastError));
      }
      subscriber.complete();
    };
    port.onDisconnect.addListener(onDisconnect);

    return removeListeners;
  });
