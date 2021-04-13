import { closeTab, createTab, listen, updateTab } from "./chrome-facade";
import { extensionId } from "./consts";
import {
  MessageFromDescription,
  getOffersPageMessage,
  goToNextPageMessage,
} from "./marketplaces/common/messaging";
import { waitFor } from "./marketplaces/common/wait-for";
import type { AppMessage } from "./marketplaces/messaging";
import { readyMessage } from "./marketplaces/messaging/messages";

export function reloadExtension() {
  chrome.runtime.reload();
}

export async function runAllegro() {
  const tab = await createTab({
    //
    active: false,
  });

  const tabInitiallyReady = waitForTabToBeReady(tab.id!);
  await updateTab(tab.id!, {
    url: "https://allegrolokalnie.pl/konto/oferty/aktywne",
  });
  await tabInitiallyReady;

  const { data: initialPage } = await getOffersPage(tab.id!);
  let nextPage = initialPage.currentPage + 1;
  const totalPages = initialPage.totalPages;
  const offers = initialPage.offers;

  while (nextPage <= totalPages) {
    const port = chrome.tabs.connect(tab.id!);
    const tabReady = waitForTabToBeReady(tab.id!);
    port.postMessage(goToNextPageMessage.request.make());
    await tabReady;

    const currentPage = await waitFor(async () => {
      const page = await getOffersPage(tab.id!);
      if (nextPage === page.data.currentPage) {
        return page;
      }
      return;
    });

    offers.push(...currentPage.data.offers);
    nextPage++;
  }
  console.log(offers);

  await closeTab(tab.id!);

  return offers;
}

function waitForTabToBeReady(tabId: number) {
  return listen(chrome.runtime.onMessage, (message: AppMessage, sender) => {
    if (sender.tab!.id !== tabId || sender.id !== extensionId) {
      return;
    }

    if (!readyMessage.is(message)) {
      console.error("Unexpected message received", message);
      return;
    }

    return true;
  });
}

function getOffersPage(tabId: number) {
  return new Promise<
    MessageFromDescription<typeof getOffersPageMessage["response"]>
  >((resolve, reject) => {
    const port = chrome.tabs.connect(tabId);

    port.onDisconnect.addListener(() => {
      console.log("Port disconnected");
      if (chrome.runtime.lastError) {
        console.log("Chrome runtime error", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      reject(new Error("Port closed"));
    });
    port.onMessage.addListener((message: AppMessage) => {
      if (!getOffersPageMessage.response.is(message)) {
        reject(
          new Error(`Unexpected message received of type: ${message.type}`)
        );
        return;
      }

      resolve(message);
    });
    port.postMessage(getOffersPageMessage.request.make());
  });
}
