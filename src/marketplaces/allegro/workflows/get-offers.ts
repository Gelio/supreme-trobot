import { closeTab, createTab, listen, updateTab } from "@app/chrome-facade";
import { extensionId } from "@app/consts";
import {
  getOffersPageMessage,
  goToNextPageMessage,
  Offer,
  tabReadyMessage,
} from "@app/marketplaces/common/messaging";
import { waitFor } from "@app/marketplaces/common/wait-for";
import type { AppMessage, MessageFromDescription } from "@app/messaging";

const offersPageUrl = "https://allegrolokalnie.pl/konto/oferty/aktywne";

export async function getOffersWorkflow(): Promise<Offer[]> {
  const tab = await createTab({ active: false });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tabId = tab.id!;

  const tabInitiallyReady = waitForTabToBeReady(tabId);
  await updateTab(tabId, { url: offersPageUrl });
  await tabInitiallyReady;

  const { data: initialPage } = await getOffersPage(tabId);
  let nextPage = initialPage.currentPage + 1;
  const totalPages = initialPage.totalPages;
  const offers = initialPage.offers;

  while (nextPage <= totalPages) {
    const port = chrome.tabs.connect(tabId);
    const tabReady = waitForTabToBeReady(tabId);
    port.postMessage(goToNextPageMessage.request.create());
    await tabReady;

    const currentPage = await waitFor(async () => {
      const page = await getOffersPage(tabId);
      if (nextPage === page.data.currentPage) {
        return page;
      }
      return;
    });

    offers.push(...currentPage.data.offers);
    nextPage++;
  }
  console.log(offers);

  await closeTab(tabId);

  return offers;
}

function waitForTabToBeReady(tabId: number) {
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
    port.postMessage(getOffersPageMessage.request.create());
  });
}
