import { Observable } from "rxjs";
import { filter, share } from "rxjs/operators";
import { v4 as generateUuid } from "uuid";

export interface AppMessage<T extends string = string, Data = unknown> {
  type: T;
  transactionId: string;
  data: Data;
}

export type ErrorMessage<E = unknown> = AppMessage<"error", E>;

export const createAppMessageBus = () =>
  new Observable<AppMessage>((subscriber) => {
    const listener = (message: AppMessage) => subscriber.next(message);

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }).pipe(share());

export const ofType = <D, T extends string>(type: T) =>
  filter(
    (message: AppMessage): message is AppMessage<T, D> => message.type === type
  );

export const ofTransaction = (transactionId: string) =>
  filter((message: AppMessage) => message.transactionId === transactionId);

export const beginTransaction = (appMessageBus: Observable<AppMessage>) => {
  const transactionId = generateUuid();
  let messagePendingPromiseResolver:
    | null
    | ((message: AppMessage) => void) = null;
  /** Latest messages are at the front */
  const bufferedMessages: AppMessage[] = [];

  const subscription = appMessageBus
    .pipe(ofTransaction(transactionId))
    .subscribe((message) => {
      if (messagePendingPromiseResolver) {
        const resolver = messagePendingPromiseResolver;
        messagePendingPromiseResolver = null;
        resolver(message);
      } else {
        bufferedMessages.unshift(message);
      }
    });

  const ensureTransactionOpen = () => {
    if (subscription.closed) {
      throw new Error("Invalid operation. Transaction has been closed");
    }
  };

  return {
    commit: () => {
      ensureTransactionOpen();

      subscription.unsubscribe();
      if (bufferedMessages.length > 0) {
        throw new Error(
          "Buffered messages must be drained before committing a transaction"
        );
      }
    },
    readMessage: (): Promise<AppMessage> => {
      ensureTransactionOpen();

      const message = bufferedMessages.pop();
      if (message) {
        return Promise.resolve(message);
      } else {
        return new Promise((resolve) => {
          messagePendingPromiseResolver = resolve;
        });
      }
    },
    sendMessage: (message: AppMessage) => {
      ensureTransactionOpen();

      // TODO: use dependency injection to determine how to send message
      // Sending the message in the popup is different from the implementation below
      chrome.runtime.sendMessage(message);
    },
  };
};
