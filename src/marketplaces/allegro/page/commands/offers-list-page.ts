import type { Offer, OffersPage } from "@app/marketplaces/common/messaging";
import {
  AppRequestHandler,
  createAppRequestResponsePair,
} from "@app/messaging";

/**
 * NOTE: PagePageCommand suffix is intended. It's a PageCommand that gets the
 * offers from a single page.
 */
export const getSingleOffersPagePageCommand = createAppRequestResponsePair<
  "PAGE/GET_OFFERS_PAGE",
  void,
  OffersPage
>("PAGE/GET_OFFERS_PAGE");

export const getOffersPage: AppRequestHandler<
  typeof getSingleOffersPagePageCommand
> = () => {
  const { currentPage, totalPages } = getPaginationState();

  return {
    offers: getOffers(),
    totalPages,
    currentPage,
  };
};

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    title: title.textContent!,
    url: title.href,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    price: price.textContent!,
    editUrl: editAnchor.href,
  };
};

const getOffersContainer = () =>
  document.querySelectorAll(".offer-card-container");

export const getOffers = (): Offer[] =>
  Array.from(getOffersContainer()).map(getOffer);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getPaginationState = () => {
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

export const goToNextPagePageCommand = createAppRequestResponsePair<"PAGE/GO_TO_NEXT_PAGE">(
  "PAGE/GO_TO_NEXT_PAGE"
);

export const goToNextPage: AppRequestHandler<
  typeof goToNextPagePageCommand
> = () => {
  const nextPageButton = document.querySelector<HTMLAnchorElement>(
    ".pagination__next"
  );
  if (!nextPageButton) {
    throw new Error("Cannot find the next page button");
  }

  return nextPageButton.click();
};
