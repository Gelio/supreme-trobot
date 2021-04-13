import {
  AppMessage,
  createResponder,
  getOffersPageMessage,
  goToNextPageMessage,
  MessageFromDescription,
} from "../common/messaging";
import {
  getOffers,
  getPaginationState,
  goToNextPage,
} from "./offers-list-page";

const getOffersPage = (): MessageFromDescription<
  typeof getOffersPageMessage["response"]
>["data"] => {
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
    createResponder(port, getOffersPageMessage, getOffersPage),
    createResponder(port, goToNextPageMessage, goToNextPage),
  ];
  const listener = (message: AppMessage) => {
    console.log("Handling message", message);
    responders.forEach((responder) => responder(message));
  };

  port.onMessage.addListener(listener);
  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(listener);
  });
});
