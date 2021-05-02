import type { Offer } from "@app/marketplaces/common/messaging";
import { createAppRequestResponsePair } from "@app/messaging";

export const getOffersCommand = createAppRequestResponsePair<
  "GET_OFFERS",
  void,
  Offer[]
>("GET_OFFERS");
