import { listen } from "./chrome-facade";
import type { Offer } from "./marketplaces/common/messaging";
import type { AppMessage } from "./messaging";
import {
  changePriceDriverCommand,
  getOffersDriverCommand,
  type WorkerState,
  workerStateUpdatedMessage,
} from "./worker";

export function reloadExtension(): void {
  chrome.runtime.reload();
}

export function connect(
  stateUpdateCb: (workerState: WorkerState) => void
): void {
  const port = chrome.runtime.connect();
  if (chrome.runtime.lastError) {
    console.error(
      "Cannot connect to the service worker",
      chrome.runtime.lastError
    );
    return;
  }

  void listen(port.onMessage, (message: AppMessage) => {
    if (workerStateUpdatedMessage.is(message)) {
      console.log("Worker state updated", message.data);
      stateUpdateCb(message.data);
      return;
    }
  });
}

export function scanAllegro(
  focusNewTab: boolean
): Promise<Offer[]> | undefined {
  const port = chrome.runtime.connect();
  if (chrome.runtime.lastError) {
    console.error(
      "Cannot connect to the service worker",
      chrome.runtime.lastError
    );
    return;
  }

  const response = listen(port.onMessage, (message: AppMessage) => {
    if (workerStateUpdatedMessage.is(message)) {
      console.log("Worker state updated", message.data);
      return;
    }

    if (!getOffersDriverCommand.response.is(message)) {
      return;
    }

    return message.data;
  });
  port.postMessage(getOffersDriverCommand.request.create({ focusNewTab }));

  return response;
}

export function changePrice(
  offer: Offer,
  newPrice: string,
  focusNewTab: boolean
): Promise<void> | undefined {
  const port = chrome.runtime.connect();
  if (chrome.runtime.lastError) {
    console.error(
      "Cannot connect to the service worker",
      chrome.runtime.lastError
    );
    return;
  }

  const response = listen(port.onMessage, (message: AppMessage) => {
    if (workerStateUpdatedMessage.is(message)) {
      console.log("Worker state updated", message.data);
      return;
    }

    if (!changePriceDriverCommand.response.is(message)) {
      return;
    }

    return message.data;
  });
  port.postMessage(
    changePriceDriverCommand.request.create({
      newPrice,
      offerEditUrl: offer.editUrl,
      focusNewTab,
    })
  );

  return response;
}
