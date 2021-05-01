import { AppMessage, createResponder } from "../messaging";
import {
  executeWorkflow,
  WorkerState,
  workerStateUpdatedMessage,
} from "../worker";
import { getOffersWorkflow } from "./workflows/get-offers";

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

    void createResponder(executeWorkflow)(port, async () => {
      updateWorkerState({ status: { type: "working" } });
      const url = "https://allegrolokalnie.pl/konto/oferty/aktywne";
      const offers = await getOffersWorkflow(url);

      updateWorkerState({ status: { type: "idle" }, offers });
      return offers;
    })(message);
  });
});
