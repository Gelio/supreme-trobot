import { getEvent$ } from "@app/chrome-facade";
import { extensionId } from "@app/consts";
import { AppMessage, createMessageDescription } from "@app/messaging";
import { task, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { filter, map } from "rxjs";
import { cancellableTask } from "./cancellation-module";

export const tabReadyPageMessage = createMessageDescription("PAGE/TAB_READY");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventPayload<E extends chrome.events.Event<any>> =
  E extends chrome.events.Event<infer F>
    ? // NOTE: cannot use `Parameters<F>` because `F` is inferred to `Function`
      // which TS does not allow using in `Parameters<F>`
      F extends (...args: infer A) => unknown
      ? A
      : never
    : never;

const matchSenderExtensionId = ([_, sender]: EventPayload<
  typeof chrome.runtime.onMessage
>) => sender.id === extensionId;

const matchSenderTabId =
  (tabId: number) =>
  ([_, sender]: EventPayload<typeof chrome.runtime.onMessage>) =>
    sender.tab?.id === tabId;

export const waitForTabToBeReady = <Reason>(
  tabId: number,
  cancellationSignal: cancellableTask.CancellationSignal<Reason>
): task.Task<cancellableTask.Cancellable<Reason, void>> => {
  const tabReadyPageMessage$ = getEvent$(chrome.runtime.onMessage).pipe(
    filter(matchSenderExtensionId),
    filter(matchSenderTabId(tabId)),
    map(([message]) => message as AppMessage),
    filter(tabReadyPageMessage.is)
  );

  return pipe(
    cancellableTask.fromObservable(cancellationSignal, tabReadyPageMessage$),
    taskEither.map(() => undefined)
  );
};
