import { tabReadyPageMessage } from "@app/marketplaces/common/messaging";
import { AppMessage, createResponder } from "@app/messaging";
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

chrome.runtime.onConnect.addListener((port) => {
  // TODO: validate port.sender.id (should match the extension ID)
  const responders = [
    createResponder(getSingleOffersPagePageCommand)(port, getOffersPage),
    createResponder(goToNextPagePageCommand)(port, goToNextPage),
    createResponder(changePricePageCommand)(port, changePrice),
    createResponder(saveChangesPageCommand)(port, saveChanges),
    createResponder(verifyPriceChangedPageCommand)(port, verifyPriceChanged),
  ];
  const listener = (message: AppMessage) => {
    console.log("Handling message", message);
    // TODO: stop trying other responders when one matches and handles the message
    responders.forEach((responder) => void responder(message));
  };

  port.onMessage.addListener(listener);
  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(listener);
  });
});

chrome.runtime.sendMessage(tabReadyPageMessage.create());
