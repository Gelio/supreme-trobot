import { getOffersWorkflow } from "@app/marketplaces/allegro/workflows";
import { AppMessage, createResponder } from "../messaging";
import { getOffersCommand } from "./commands";
import { WorkerState, workerStateUpdatedMessage } from "./state";

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

    void createResponder(getOffersCommand)(port, async () => {
      updateWorkerState({ status: { type: "working" } });
      const offers = await getOffersWorkflow();

      updateWorkerState({ status: { type: "idle" }, offers });
      return offers;
    })(message);
  });
});
