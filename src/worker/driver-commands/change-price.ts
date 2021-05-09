import { changePriceWorkflow } from "@app/marketplaces/allegro/workflows";
import { createAppRequestResponsePair, createResponder } from "@app/messaging";
import { updateState, WorkerStore } from "../state";

export const changePriceDriverCommand = createAppRequestResponsePair<
  "DRIVER/CHANGE_PRICE",
  { newPrice: string; offerEditUrl: string; focusNewTab: boolean }
>("DRIVER/CHANGE_PRICE");

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const changePriceDriverCommandResponder = (store: WorkerStore) =>
  createResponder(
    changePriceDriverCommand,
    async ({ data: { newPrice, offerEditUrl, focusNewTab } }) => {
      store.dispatch(updateState({ status: { type: "working" } }));
      await changePriceWorkflow({ newPrice, offerEditUrl, focusNewTab });
      store.dispatch(updateState({ status: { type: "idle" } }));
    }
  );
