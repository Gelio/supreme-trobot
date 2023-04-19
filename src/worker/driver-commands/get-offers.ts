import { getOffersWorkflow } from "@app/marketplaces/allegro/workflows";
import type { Offer } from "@app/marketplaces/common/messaging";
import { createAppRequestResponsePair, createResponder } from "@app/messaging";
import { updateState, type WorkerStore } from "../state";

export const getOffersDriverCommand = createAppRequestResponsePair<
  "DRIVER/GET_OFFERS",
  { focusNewTab: boolean },
  Offer[]
>("DRIVER/GET_OFFERS");

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getOffersDriverCommandResponder = (store: WorkerStore) =>
  createResponder(getOffersDriverCommand, async ({ data: { focusNewTab } }) => {
    store.dispatch(updateState({ status: { type: "working" } }));
    const offers = await getOffersWorkflow(focusNewTab);
    void chrome.storage.local.set({ offers });

    store.dispatch(updateState({ status: { type: "idle" }, offers }));
    return offers;
  });
