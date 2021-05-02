import {
  AppMessage,
  AppRequestResponder,
  createResponder,
} from "@app/messaging";
import {
  getOffersPageMessage,
  goToNextPageMessage,
  tabReadyMessage,
} from "../common/messaging";
import {
  changePriceCommand,
  saveChangesCommand,
  verifyPriceChangedCommand,
} from "../common/messaging/manage-offer";
import {
  changePrice,
  saveChanges,
  verifyPriceChanged,
} from "./commands/offer-page";
import {
  getOffers,
  getPaginationState,
  goToNextPage,
} from "./commands/offers-list-page";

const getOffersPage: AppRequestResponder<typeof getOffersPageMessage> = () => {
  const { currentPage, totalPages } = getPaginationState();

  return {
    offers: getOffers(),
    totalPages,
    currentPage,
  };
};

chrome.runtime.onConnect.addListener((port) => {
  // TODO: validate port.sender.id (should match the extension ID)
  const responders = [
    createResponder(getOffersPageMessage)(port, getOffersPage),
    createResponder(goToNextPageMessage)(port, goToNextPage),
    createResponder(changePriceCommand)(port, changePrice),
    createResponder(saveChangesCommand)(port, saveChanges),
    createResponder(verifyPriceChangedCommand)(port, verifyPriceChanged),
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

chrome.runtime.sendMessage(tabReadyMessage.create());
