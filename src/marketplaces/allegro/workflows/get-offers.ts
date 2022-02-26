import { closeTab, updateTabTask, withNewTab } from "@app/chrome-facade";
import {
  executeCommand,
  Offer,
  waitForTabToBeReady,
} from "@app/marketplaces/common/messaging";
import type { cancellableTask } from "@app/marketplaces/common/messaging/cancellation-module";
import { waitFor } from "@app/marketplaces/common/wait-for";
import { either, task, taskEither } from "fp-ts";
import { sequenceT } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import {
  getSingleOffersPagePageCommand,
  goToNextPagePageCommand,
} from "../page/commands";

const offersPageUrl = "https://allegrolokalnie.pl/konto/oferty/aktywne";

const withNewTabAtUrl = <CancellationReason>(
  url: string,
  properties: chrome.tabs.CreateProperties,
  cancellationSignal: cancellableTask.CancellationSignal<CancellationReason>
): task.Task<cancellableTask.Cancellable<CancellationReason, number>> =>
  withNewTab(properties, (tabId) =>
    pipe(
      sequenceT(taskEither.ApplyPar)(
        waitForTabToBeReady(tabId, cancellationSignal),
        pipe(
          updateTabTask(tabId, { url }),
          task.map(() => either.right(undefined))
        )
      ),
      taskEither.map(() => tabId)
    )
  );

export async function getOffersWorkflow(
  focusNewTab: boolean
): Promise<Offer[]> {
  const tab = await createTab({ active: focusNewTab });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tabId = tab.id!;

  const tabInitiallyReady = waitForTabToBeReady(tabId);
  await updateTab(tabId, { url: offersPageUrl });
  await tabInitiallyReady;

  const { data: initialPage } = await executeCommand(
    tabId,
    getSingleOffersPagePageCommand.pair,
    undefined
  );
  let nextPage = initialPage.currentPage + 1;
  const totalPages = initialPage.totalPages;
  const offers = initialPage.offers;

  while (nextPage <= totalPages) {
    const port = chrome.tabs.connect(tabId);
    const tabReady = waitForTabToBeReady(tabId);
    port.postMessage(goToNextPagePageCommand.pair.request.create());
    await tabReady;

    const currentPage = await waitFor(async () => {
      const page = await executeCommand(
        tabId,
        getSingleOffersPagePageCommand.pair,
        undefined
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
