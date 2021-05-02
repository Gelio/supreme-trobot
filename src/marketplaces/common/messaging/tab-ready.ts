import { listen } from "@app/chrome-facade";
import { extensionId } from "@app/consts";
import { AppMessage, createMessageDescription } from "@app/messaging";

export const tabReadyMessage = createMessageDescription("tab ready");

export function waitForTabToBeReady(tabId: number): Promise<true> {
  return listen(chrome.runtime.onMessage, (message: AppMessage, sender) => {
    if (sender.tab?.id !== tabId || sender.id !== extensionId) {
      return;
    }

    if (!tabReadyMessage.is(message)) {
      console.error("Unexpected message received", message);
      return;
    }

    return true;
  });
}
