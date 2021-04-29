import {
  createAppRequestResponsePair,
  createMessageDescription,
} from "@app/messaging";

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

export const getOffersPageMessage = createAppRequestResponsePair({
  request: createMessageDescription<void>("get offers page"),
  response: createMessageDescription<OffersPage>("get offers page response"),
});

export const goToNextPageMessage = createAppRequestResponsePair({
  request: createMessageDescription<never>("go to next page"),
  response: createMessageDescription<void>("go to next page success"),
});
