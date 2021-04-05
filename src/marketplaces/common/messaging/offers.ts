import {
  AppMessage,
  createAppMessagePair,
  createMessageDescription,
} from "./base";

export interface OfferInfo {
  title: string;
  url: string;
  // TODO: parse price to be a number
  price: string;
  editUrl: string;
}

export type GetOffersInfoMessage = AppMessage<"get offers info", OfferInfo[]>;
export const getOffersInfoMessage = createAppMessagePair({
  request: createMessageDescription<never>("get offers info"),
  response: createMessageDescription<OfferInfo[]>("get offers info response"),
});
