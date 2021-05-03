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
}

export async function changePriceWorkflow({
  newPrice,
  offerEditUrl,
}: ChangePriceWorkflowParams): Promise<void> {
  const tab = await createTab({ active: false });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tabId = tab.id!;

  const tabInitiallyReady = waitForTabToBeReady(tabId);
  await updateTab(tabId, { url: offerEditUrl });
  await tabInitiallyReady;

  await executeCommand(
    tabId,
    changePricePageCommand,
    changePricePageCommand.request.create({ newPrice })
  );

  await executeCommand(
    tabId,
    saveChangesPageCommand,
    saveChangesPageCommand.request.create()
  );

  await waitFor(() =>
    executeCommand(
      tabId,
      verifyPriceChangedPageCommand,
      verifyPriceChangedPageCommand.request.create({ price: newPrice })
    )
  );

  await closeTab(tabId);
}
