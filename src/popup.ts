import { listen } from "./chrome-facade";
import type { AppMessage } from "./messaging";
import { executeWorkflow, workerStateUpdatedMessage } from "./worker";

export function reloadExtension() {
  chrome.runtime.reload();
}

export function runAllegro() {
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

    if (!executeWorkflow.response.is(message)) {
      return;
    }

    return message.data;
  });
  port.postMessage(executeWorkflow.request.create());

  return response;
}
