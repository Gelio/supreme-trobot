import { queueOperation } from "../common/queue-operation";

const getOfferInfo = (offerWrapper: Element) => {
  const titleSelector = ".offer-card__title";
  const priceSelector = ".price";

  const title = offerWrapper.querySelector(titleSelector);
  const price = offerWrapper.querySelector(priceSelector);

  return {
    title: title?.textContent,
    price: price?.textContent,
  };
};

const getOffers = () => document.querySelectorAll(".offer-card-container");

const getOffersInfo = () => Array.from(getOffers()).map(getOfferInfo);

queueOperation();

chrome.runtime.onMessage.addListener((message: any) => {
  if (message === "offers") {
    const offers = getOffersInfo();
    console.log(offers);
    chrome.runtime.sendMessage(offers);
  } else if (message === "next") {
    document.querySelector<HTMLAnchorElement>(".pagination__next")?.click();
  }
});
