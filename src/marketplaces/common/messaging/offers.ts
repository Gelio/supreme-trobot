import { createAppMessagePair, createMessageDescription } from "./base";

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

export const getOffersPageMessage = createAppMessagePair({
  request: createMessageDescription<never>("get offers page"),
  response: createMessageDescription<OffersPage>("get offers page response"),
});

export const goToNextPageMessage = createAppMessagePair({
  request: createMessageDescription<never>("go to next page"),
  response: createMessageDescription<void>("go to next page success"),
});
