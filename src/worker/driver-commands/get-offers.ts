import type { Offer } from "@app/marketplaces/common/messaging";
import { createAppRequestResponsePair } from "@app/messaging";

export const getOffersDriverCommand = createAppRequestResponsePair<
  "DRIVER/GET_OFFERS",
  { focusNewTab: boolean },
  Offer[]
>("DRIVER/GET_OFFERS");
