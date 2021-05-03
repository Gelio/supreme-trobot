import { createAppRequestResponsePair } from "@app/messaging";

export interface Offer {
  title: string;
  url: string;
  // TODO: parse price to be a number
  price: string;
  editUrl: string;
}

export interface OffersPage {
  offers: Offer[];
  currentPage: number;
  totalPages: number;
}

/**
 * NOTE: PagePageCommand suffix is intended. It's a PageCommand that gets the
 * offers from a single page.
 */
export const getSingleOffersPagePageCommand = createAppRequestResponsePair<
  "PAGE/GET_OFFERS_PAGE",
  void,
  OffersPage
>("PAGE/GET_OFFERS_PAGE");

export const goToNextPagePageCommand = createAppRequestResponsePair<"PAGE/GO_TO_NEXT_PAGE">(
  "PAGE/GO_TO_NEXT_PAGE"
);
