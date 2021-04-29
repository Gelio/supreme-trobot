import {
  AppMessage,
  AppRequestResponder,
  createResponder,
} from "@app/messaging";
import { readyMessage } from "@app/messaging/messages";
import { getOffersPageMessage, goToNextPageMessage } from "../common/messaging";
import {
  getOffers,
  getPaginationState,
  goToNextPage,
} from "./offers-list-page";

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

chrome.runtime.sendMessage(readyMessage.create());
