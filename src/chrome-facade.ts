// Functions that ease the use of the chrome API

// TODO: use a _promisify_ helper to avoid writing types by hand

export function createTab(
  properties: chrome.tabs.CreateProperties
): Promise<chrome.tabs.Tab> {
  return new Promise((resolve) => {
    chrome.tabs.create(properties, resolve);
  });
}

export function closeTab(tabId: number) {
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
export function listen<F extends (...args: any[]) => any, R>(
  event: chrome.events.Event<F>,
  callback: (...params: Parameters<F>) => R | undefined
) {
  return new Promise<R>((resolve) => {
    const listener = (...args: any[]) => {
      const result = callback(...(args as any));
      if (result === undefined) {
        return;
      }

      event.removeListener(listener as any);
      resolve(result);
    };
    event.addListener(listener as any);
  });
}
