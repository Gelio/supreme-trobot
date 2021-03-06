import type {
  AppMessage,
  AppRequestResponsePair,
  MessageFromDescription,
} from "@app/messaging";

export function executeCommand<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends AppRequestResponsePair<string, any, any>
>(
  tabId: number,
  requestResponsePair: P,
  requestData: MessageFromDescription<P["request"]>["data"]
): Promise<MessageFromDescription<P["response"]>> {
  return new Promise((resolve, reject) => {
    const port = chrome.tabs.connect(tabId);

    port.onDisconnect.addListener(() => {
      console.log("Port disconnected");
      if (chrome.runtime.lastError) {
        console.log("Chrome runtime error", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      reject(new Error("Port closed"));
    });
    port.onMessage.addListener((message: AppMessage) => {
      if (!requestResponsePair.response.is(message)) {
        reject(
          new Error(`Unexpected message received of type: ${message.type}`)
        );
        return;
      }

      // NOTE: TS assumes there cannot be such a message, problems with generics
      resolve(message as MessageFromDescription<P["response"]>);
    });

    port.postMessage(requestResponsePair.request.create(requestData));
  });
}
