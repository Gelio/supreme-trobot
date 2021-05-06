import { closeTab, createTab, updateTab } from "@app/chrome-facade";
import {
  executeCommand,
  waitForTabToBeReady,
} from "@app/marketplaces/common/messaging";
import { waitFor } from "@app/marketplaces/common/wait-for";
import {
  changePricePageCommand,
  saveChangesPageCommand,
  verifyPriceChangedPageCommand,
} from "../page/commands";

export interface ChangePriceWorkflowParams {
  offerEditUrl: string;
  newPrice: string;
  focusNewTab: boolean;
}

export async function changePriceWorkflow({
  newPrice,
  offerEditUrl,
  focusNewTab,
}: ChangePriceWorkflowParams): Promise<void> {
  const tab = await createTab({ active: focusNewTab });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tabId = tab.id!;

  const tabInitiallyReady = waitForTabToBeReady(tabId);
  await updateTab(tabId, { url: offerEditUrl });
  await tabInitiallyReady;

  await executeCommand(tabId, changePricePageCommand.pair, { newPrice });

  await executeCommand(tabId, saveChangesPageCommand.pair, undefined);

  await waitFor(
    () =>
      executeCommand(tabId, verifyPriceChangedPageCommand.pair, {
        price: newPrice,
      }),
    { retriesCount: 10 }
  );

  await closeTab(tabId);
}
