import {
  AppMessage,
  createResponder,
  getOffersPageMessage,
  MessageFromDescription,
  Offer,
} from "../common/messaging";

const getOffer = (offerWrapper: Element): Offer => {
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

const getOffersContainer = () =>
  document.querySelectorAll(".offer-card-container");

const getOffers = () => Array.from(getOffersContainer()).map(getOffer);

const getPaginationState = () => {
  const paginationSelector = ".pagination__pages";

  const paginationWrapper = document.querySelector(paginationSelector);
  if (!paginationWrapper) {
    throw new Error("Cannot find pagination wrapper");
  }

  const currentPageInput = paginationWrapper.querySelector<HTMLInputElement>(
    'input[name="page"]'
  );
  if (!currentPageInput) {
    throw new Error("Cannot find current page input");
  }

  const totalPagesRegexp = /z (\d)+/;
  const totalPagesMatches = totalPagesRegexp.exec(
    paginationWrapper.textContent!
  );
  if (!totalPagesMatches) {
    throw new Error("Cannot match total pages");
  }

  return {
    currentPage: parseInt(currentPageInput.value, 10),
    totalPages: parseInt(totalPagesMatches[1], 10),
  };
};

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
