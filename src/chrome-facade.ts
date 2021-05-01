// Functions that ease the use of the chrome API

// TODO: use a _promisify_ helper to avoid writing types by hand

export function createTab(
  properties: chrome.tabs.CreateProperties
): Promise<chrome.tabs.Tab> {
  return new Promise((resolve) => {
    chrome.tabs.create(properties, resolve);
  });
}

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

export function closeTab(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.remove(tabId, resolve);
  });
}

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
