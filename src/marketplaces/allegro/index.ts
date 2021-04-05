import {
  AppMessage,
  createResponder,
  getOffersInfoMessage,
  OfferInfo,
} from "../common/messaging";

const getOfferInfo = (offerWrapper: Element): OfferInfo => {
  const titleSelector = "a.offer-card__title";
  const priceSelector = ".price";
  const editText = "Edytuj";

  const title = offerWrapper.querySelector<HTMLAnchorElement>(titleSelector);
  const price = offerWrapper.querySelector(priceSelector);
  const editAnchor: HTMLAnchorElement | undefined = Array.from(
    offerWrapper.querySelectorAll<HTMLAnchorElement>("a")
  ).filter((element) => element.textContent === editText)[0];
  if (!title) {
    throw new Error("Cannot find the title element");
  } else if (!price) {
    throw new Error("Cannot find the price element");
  }

  return {
    title: title.textContent!,
    url: title.href,
    price: price.textContent!,
    editUrl: editAnchor.href,
  };
};

const getOffers = () => document.querySelectorAll(".offer-card-container");

const getOffersInfo = () => Array.from(getOffers()).map(getOfferInfo);

chrome.runtime.onConnect.addListener((port) => {
  // TODO: validate port.sender.id (should match the extension ID)
  const responders = [
    createResponder(port, getOffersInfoMessage, getOffersInfo),
  ];
  const listener = (message: AppMessage) => {
    console.log(message);
    responders.forEach((responder) => responder(message));
    if (message.type === "next") {
      document.querySelector<HTMLAnchorElement>(".pagination__next")?.click();
    }
  };

  port.onMessage.addListener(listener);
  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(listener);
  });
});
