import { closeTab, createTab, updateTab } from "@app/chrome-facade";
import {
  executeCommand,
  getOffersPageMessage,
  goToNextPageMessage,
  Offer,
  waitForTabToBeReady,
} from "@app/marketplaces/common/messaging";
import { waitFor } from "@app/marketplaces/common/wait-for";

const offersPageUrl = "https://allegrolokalnie.pl/konto/oferty/aktywne";

export async function getOffersWorkflow(): Promise<Offer[]> {
  const tab = await createTab({ active: false });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tabId = tab.id!;

  const tabInitiallyReady = waitForTabToBeReady(tabId);
  await updateTab(tabId, { url: offersPageUrl });
  await tabInitiallyReady;

  const { data: initialPage } = await executeCommand(
    tabId,
    getOffersPageMessage,
    getOffersPageMessage.request.create()
  );
  let nextPage = initialPage.currentPage + 1;
  const totalPages = initialPage.totalPages;
  const offers = initialPage.offers;

  while (nextPage <= totalPages) {
    const port = chrome.tabs.connect(tabId);
    const tabReady = waitForTabToBeReady(tabId);
    port.postMessage(goToNextPageMessage.request.create());
    await tabReady;

    const currentPage = await waitFor(async () => {
      const page = await executeCommand(
        tabId,
        getOffersPageMessage,
        getOffersPageMessage.request.create()
      );
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