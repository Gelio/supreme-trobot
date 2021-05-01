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

export const getOffersPageMessage = createAppRequestResponsePair<
  "GET_OFFERS_PAGE",
  void,
  OffersPage
>("GET_OFFERS_PAGE");

export const goToNextPageMessage = createAppRequestResponsePair<"GO_TO_NEXT_PAGE">(
  "GO_TO_NEXT_PAGE"
);
