import { closeTab, createTab, updateTab } from "@app/chrome-facade";
import {
  changePriceCommand,
  executeCommand,
  saveChangesCommand,
  verifyPriceChangedCommand,
  waitForTabToBeReady,
} from "@app/marketplaces/common/messaging";
import { waitFor } from "@app/marketplaces/common/wait-for";

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
    changePriceCommand,
    changePriceCommand.request.create({ newPrice })
  );

  await executeCommand(
    tabId,
    saveChangesCommand,
    saveChangesCommand.request.create()
  );

  await waitFor(() =>
    executeCommand(
      tabId,
      verifyPriceChangedCommand,
      verifyPriceChangedCommand.request.create({ price: newPrice })
    )
  );

  await closeTab(tabId);
}
