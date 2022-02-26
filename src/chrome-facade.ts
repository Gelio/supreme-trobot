// Functions that ease the use of the chrome API

import { option, task, taskOption } from "fp-ts";
import { pipe } from "fp-ts/function";
import { Observable } from "rxjs";

// TODO: use a _promisify_ helper to avoid writing types by hand

/**
 * @deprecated Use createTabTask instead
 */
export function createTab(
  properties: chrome.tabs.CreateProperties
): Promise<chrome.tabs.Tab> {
  return createTabTask(properties)();
}

export const createTabTask =
  (properties: chrome.tabs.CreateProperties): task.Task<chrome.tabs.Tab> =>
  () =>
    new Promise((resolve) => {
      chrome.tabs.create(properties, resolve);
    });

/**
 * @deprecated Use `updateTabTask` instead
 */
export function updateTab(
  tabId: number,
  properties: chrome.tabs.UpdateProperties
): Promise<chrome.tabs.Tab> {
  return new Promise((resolve, reject) => {
    chrome.tabs.update(tabId, properties, (tab) =>
      tab ? resolve(tab) : reject(new Error("Tab was not present"))
    );
  });
}

export const updateTabTask =
  (
    tabId: number,
    properties: chrome.tabs.UpdateProperties
  ): taskOption.TaskOption<chrome.tabs.Tab> =>
  () =>
    new Promise((resolve) => {
      chrome.tabs.update(tabId, properties, (tab) =>
        resolve(option.fromNullable(tab))
      );
    });

export function closeTab(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.remove(tabId, resolve);
  });
}

export const closeTabTask =
  (tabId: number): task.Task<void> =>
  () =>
    new Promise((resolve) => {
      chrome.tabs.remove(tabId, resolve);
    });

export const withNewTab = <T>(
  properties: chrome.tabs.CreateProperties,
  callback: (tabId: number) => task.Task<T>
) =>
  pipe(
    createTabTask(properties),
    // SAFETY: the created tab must have an `id` field defined
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    task.map((tab) => tab.id!),
    task.chain((tabId) =>
      pipe(
        callback(tabId),
        task.chainFirst(() => closeTabTask(tabId))
      )
    )
  );

/**
 * Listens to an event listener and invokes `callback` on each event.
 * Keeps listening if the callback returns `undefined`.
 * If it returns any other value, the returned Promise is resolved with
 * that value, and the listener is removed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function listen<F extends (...args: any[]) => any, R>(
  event: chrome.events.Event<F>,
  callback: (...params: Parameters<F>) => R | undefined
): Promise<R> {
  return new Promise<R>((resolve) => {
    const listener = (...args: unknown[]) => {
      const result = callback(...(args as Parameters<F>));
      if (result === undefined) {
        return;
      }

      event.removeListener(listener as F);
      resolve(result);
    };
    event.addListener(listener as F);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEvent$ = <F extends (...args: any[]) => any>(
  event: chrome.events.Event<F>
) =>
  new Observable<Parameters<F>>((subscriber) => {
    const listener = (...args: unknown[]) => {
      subscriber.next(args as Parameters<F>);
    };
    event.addListener(listener as F);

    return () => event.removeListener(listener as F);
  });
