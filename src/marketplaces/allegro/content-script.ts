import {
  AppMessage,
  AppRequestResponder,
  createResponder,
} from "@app/messaging";
import {
  getSingleOffersPagePageCommand,
  goToNextPagePageCommand,
  tabReadyMessage,
} from "../common/messaging";
import {
  changePricePageCommand,
  saveChangesPageCommand,
  verifyPriceChangedPageCommand,
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

const getOffersPage: AppRequestResponder<typeof getSingleOffersPagePageCommand> = () => {
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

chrome.runtime.sendMessage(tabReadyMessage.create());
