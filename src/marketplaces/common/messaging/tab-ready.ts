import { listen } from "@app/chrome-facade";
import { extensionId } from "@app/consts";
import { AppMessage, createMessageDescription } from "@app/messaging";

export const tabReadyPageMessage = createMessageDescription("PAGE/TAB_READY");

export function waitForTabToBeReady(tabId: number): Promise<true> {
  return listen(chrome.runtime.onMessage, (message: AppMessage, sender) => {
    if (sender.tab?.id !== tabId || sender.id !== extensionId) {
      return;
    }

    if (!tabReadyPageMessage.is(message)) {
      console.error("Unexpected message received", message);
      return;
    }

    return true;
  });
}
