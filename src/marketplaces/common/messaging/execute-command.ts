import {
  AppMessage,
  AppRequestResponsePair,
  getPortMessage$,
  MessageFromDescription,
} from "@app/messaging";
import { either, task, taskEither } from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { cancellableTask } from "./cancellation-module";

export type ExecuteCommandError =
  | {
      type: "chrome-error";
      error: chrome.runtime.LastError;
    }
  | {
      type: "unexpected-message";
      message: AppMessage;
    };

export const executeCommand = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends AppRequestResponsePair<string, any, any>,
  CancellationReason
>({
  tabId,
  cancellationSignal,
  requestResponsePair,
  requestData,
}: {
  tabId: number;
  cancellationSignal: cancellableTask.CancellationSignal<CancellationReason>;
  requestResponsePair: P;
  requestData: MessageFromDescription<P["request"]>["data"];
}) => {
  const port = chrome.tabs.connect(tabId);
  const portMessage$ = getPortMessage$(port);

  return pipe(
    cancellableTask.fromObservable(cancellationSignal, portMessage$),
    taskEither.map(
      flow(
        either.mapLeft(
          (chromeError): ExecuteCommandError => ({
            type: "chrome-error",
            error: chromeError,
          })
        ),
        either.filterOrElse(
          requestResponsePair.response.is,
          (message): ExecuteCommandError => ({
            type: "unexpected-message",
            message,
          })
        ),
        either.map(
          // NOTE: TS assumes there cannot be such a message, problems with generics
          (message) => message as MessageFromDescription<P["response"]>
        )
      )
    ),
    task.apFirst(
      task.fromIO(() => {
        port.postMessage(requestResponsePair.request.create(requestData));
      })
    )
  );
};
