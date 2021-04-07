<script lang="typescript">
  import {
    getOffersPageMessage,
    goToNextPageMessage,
  } from "./marketplaces/common/messaging";
  import type {
    MessageFromDescription,
    AppMessage,
  } from "./marketplaces/common/messaging";
  import { waitFor } from "./marketplaces/common/wait-for";

  function reloadExtension() {
    chrome.runtime.reload();
  }

  async function runAllegro() {
    const activeTab = (
      await chrome.tabs.query({ active: true, currentWindow: true })
    )[0];
    console.log(activeTab);

    function getOffersPage() {
      return new Promise<
        MessageFromDescription<typeof getOffersPageMessage["response"]>
      >((resolve, reject) => {
        const port = chrome.tabs.connect(activeTab.id!);
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

    const { data: initialPage } = await getOffersPage();
    let nextPage = initialPage.currentPage + 1;
    const totalPages = initialPage.totalPages;
    const offers = initialPage.offers;

    while (nextPage <= totalPages) {
      const port = chrome.tabs.connect(activeTab.id!);
      port.postMessage(goToNextPageMessage.request.make());

      const currentPage = await waitFor(async () => {
        const page = await getOffersPage();
        if (nextPage === page.data.currentPage) {
          return page;
        }
      });

      offers.push(...currentPage.data.offers);
      nextPage++;
    }

    console.log("Got all offers", offers);
  }
</script>

<div class="App">
  <button on:click={reloadExtension}>Reload extension</button>
  <button on:click={runAllegro}>Run Allegro</button>
</div>
