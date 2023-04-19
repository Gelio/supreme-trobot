import { type AppMessage, combineResponders } from "../messaging";
import {
  changePriceDriverCommandResponder,
  getOffersDriverCommandResponder,
} from "./driver-commands";
import {
  createWorkerStore,
  updateState,
  workerStateUpdatedMessage,
} from "./state";

const store = createWorkerStore();

chrome.storage.local.get((items) => {
  if (items.offers) {
    store.dispatch(
      updateState({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        offers: items.offers,
      })
    );
  }
});

// TODO: extract a "ports notifier" class that encapsulates the logic in 1 place
/** Ports to notify about worker state updates. I.e. any connected port */
const portsToNotify: Set<chrome.runtime.Port> = new Set();

store.subscribe(() => {
  portsToNotify.forEach((port) =>
    port.postMessage(workerStateUpdatedMessage.create(store.getState()))
  );
});

const respond = combineResponders(
  changePriceDriverCommandResponder(store),
  getOffersDriverCommandResponder(store)
);

chrome.runtime.onConnect.addListener((port) => {
  portsToNotify.add(port);
  port.onDisconnect.addListener(() => {
    portsToNotify.delete(port);
  });

  // Initial state update
  port.postMessage(workerStateUpdatedMessage.create(store.getState()));

  port.onMessage.addListener((message: AppMessage) => {
    if (store.getState().status.type === "working") {
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
