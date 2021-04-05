import {
  AppMessage,
  getOffersInfoMessage,
  OfferInfo,
} from "../common/messaging";

const getOfferInfo = (offerWrapper: Element): OfferInfo => {
  const titleSelector = ".offer-card__title";
  const priceSelector = ".price";
  const editText = "Edytuj";

  const title = offerWrapper.querySelector(titleSelector);
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
    price: price.textContent!,
    editUrl: editAnchor.href,
  };
};

const getOffers = () => document.querySelectorAll(".offer-card-container");

const getOffersInfo = () => Array.from(getOffers()).map(getOfferInfo);

chrome.runtime.onConnect.addListener((port) => {
  // TODO: validate port.sender.id (should match the extension ID)
  const listener = (message: AppMessage) => {
    console.log(message);
    if (getOffersInfoMessage.request.is(message)) {
      const offers = getOffersInfo();
      console.log(offers);
      port.postMessage(getOffersInfoMessage.response.make(offers));
    } else if (message.type === "next") {
      document.querySelector<HTMLAnchorElement>(".pagination__next")?.click();
    }
  };

  port.onMessage.addListener(listener);
  port.onDisconnect.addListener(() => {
    port.onMessage.removeListener(listener);
  });
});
