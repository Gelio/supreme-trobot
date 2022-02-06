import { either } from "fp-ts";
import { pipe } from "fp-ts/function";
import { finalize, map } from "rxjs";
import { combineResponders, getPortMessage$ } from "../messaging";
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
  getPortMessage$(port)
    .pipe(
      finalize(() => {
        portsToNotify.delete(port);
      }),
      map((messageResult) =>
        pipe(
          messageResult,
          either.mapLeft(
            (lastError) =>
              ({
                type: "chrome-error",
                error: lastError,
              } as const)
          ),
          either.filterOrElseW(
            // NOTE: type inference does not work when the parameter is not specified
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_message) => store.getState().status.type === "idle",
            (message) =>
              ({
                type: "worker-busy",
                receivedMessage: message,
              } as const)
          )
        )
      )
    )
    .subscribe((messageResult) =>
      pipe(
        messageResult,
        either.match(
          (error) => {
            if (error.type === "chrome-error") {
              console.error("Error in port", error.error);
            } else if (error.type === "worker-busy") {
              console.warn(
                "Recevied message while the worker was busy. Message:",
                error.receivedMessage
              );
            }
          },
          (message) => {
            if (!respond(port, message)) {
              console.error(
                "Message was not handled by registered responders",
                message
              );
            }
          }
        )
      )
    );

  // Initial state update
  port.postMessage(workerStateUpdatedMessage.create(store.getState()));
});
