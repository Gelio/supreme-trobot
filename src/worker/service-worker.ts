import {
  changePriceWorkflow,
  getOffersWorkflow,
} from "@app/marketplaces/allegro/workflows";
import { AppMessage, combineResponders, createResponder } from "../messaging";
import {
  changePriceDriverCommand,
  getOffersDriverCommand,
} from "./driver-commands";
import { WorkerState, workerStateUpdatedMessage } from "./state";

chrome.storage.local.get((items) => {
  if (items.offers) {
    updateWorkerState({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      offers: items.offers,
    });
  }
});

let workerState: WorkerState = { status: { type: "idle" } };
/** Ports to notify about worker state updates. I.e. any connected port */
const portsToNotify: Set<chrome.runtime.Port> = new Set();

function updateWorkerState(stateUpdate: Partial<WorkerState>) {
  workerState = {
    ...workerState,
    ...stateUpdate,
  };

  portsToNotify.forEach((port) =>
    port.postMessage(workerStateUpdatedMessage.create(workerState))
  );
}

const respond = combineResponders(
  createResponder(getOffersDriverCommand, async () => {
    updateWorkerState({ status: { type: "working" } });
    const offers = await getOffersWorkflow();
    chrome.storage.local.set({ offers });

    updateWorkerState({ status: { type: "idle" }, offers });
    return offers;
  }),
  createResponder(
    changePriceDriverCommand,
    async ({ data: { newPrice, offerEditUrl } }) => {
      console.log("got change price command");
      updateWorkerState({ status: { type: "working" } });
      await changePriceWorkflow({ newPrice, offerEditUrl });
      updateWorkerState({ status: { type: "idle" } });
    }
  )
);

chrome.runtime.onConnect.addListener((port) => {
  portsToNotify.add(port);
  port.onDisconnect.addListener(() => {
    portsToNotify.delete(port);
  });

  // Initial state update
  port.postMessage(workerStateUpdatedMessage.create(workerState));

  port.onMessage.addListener((message: AppMessage) => {
    if (workerState.status.type === "working") {
      console.error("Received message", message, "when worker was working");
      return;
    }

    if (!respond(port, message)) {
      console.error(
        "Message was not handled by registered responders",
        message
      );
    }
  });
});
