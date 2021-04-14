import { AppMessage, createResponder } from "./messaging";
import {
  executeWorkflow,
  WorkerState,
  workerStateUpdatedMessage,
} from "./worker";
import { getOffersWorkflow } from "./worker/workflows/get-offers";

let workerState: WorkerState = { type: "idle" };
/** Ports to notify about worker state updates. I.e. any connected port */
const portsToNotify: Set<chrome.runtime.Port> = new Set();

function updateWorkerState(newState: WorkerState) {
  workerState = newState;

  portsToNotify.forEach((port) =>
    port.postMessage(workerStateUpdatedMessage.create(workerState))
  );
}

chrome.runtime.onConnect.addListener((port) => {
  portsToNotify.add(port);
  port.onDisconnect.addListener(() => {
    portsToNotify.delete(port);
  });

  // Initial state update
  port.postMessage(workerStateUpdatedMessage.create(workerState));

  port.onMessage.addListener((message: AppMessage) => {
    if (workerState.type === "working") {
      console.error("Received message", message, "when worker was working");
      return;
    }

    createResponder(executeWorkflow)(port, async () => {
      updateWorkerState({ type: "working" });
      const url = "https://allegrolokalnie.pl/konto/oferty/aktywne";
      const offers = await getOffersWorkflow(url);

      updateWorkerState({ type: "idle" });
      return offers;
    });
  });
});
