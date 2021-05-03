import { tabReadyPageMessage } from "@app/marketplaces/common/messaging";
import { AppMessage, combineResponders, createResponder } from "@app/messaging";
import {
  changePrice,
  changePricePageCommand,
  getOffersPage,
  getSingleOffersPagePageCommand,
  goToNextPage,
  goToNextPagePageCommand,
  saveChanges,
  saveChangesPageCommand,
  verifyPriceChanged,
  verifyPriceChangedPageCommand,
} from "./commands";

const respond = combineResponders(
  createResponder(getSingleOffersPagePageCommand, getOffersPage),
  createResponder(goToNextPagePageCommand, goToNextPage),
  createResponder(changePricePageCommand, changePrice),
  createResponder(saveChangesPageCommand, saveChanges),
  createResponder(verifyPriceChangedPageCommand, verifyPriceChanged)
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
