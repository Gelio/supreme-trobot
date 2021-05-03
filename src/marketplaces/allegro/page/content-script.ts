import { tabReadyPageMessage } from "@app/marketplaces/common/messaging";
import { AppMessage, combineResponders } from "@app/messaging";
import {
  changePricePageCommand,
  getSingleOffersPagePageCommand,
  goToNextPagePageCommand,
  saveChangesPageCommand,
  verifyPriceChangedPageCommand,
} from "./commands";

const respond = combineResponders(
  getSingleOffersPagePageCommand.responder,
  goToNextPagePageCommand.responder,
  changePricePageCommand.responder,
  saveChangesPageCommand.responder,
  verifyPriceChangedPageCommand.responder
);

chrome.runtime.onConnect.addListener((port) => {
  // TODO: validate port.sender.id (should match the extension ID)
  const listener = (message: AppMessage) => {
    console.log("Handling message", message);

    if (!respond(port, message)) {
      console.error(
        "Message was not handled by registered responders",
        message
      );
    }
  };

  port.onMessage.addListener(listener);
  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(listener);
  });
});

chrome.runtime.sendMessage(tabReadyPageMessage.create());
