import { createAppRequestResponsePair } from "@app/messaging";

export const changePriceMessage = createAppRequestResponsePair<
  "CHANGE_PRICE",
  { newPrice: string }
>("CHANGE_PRICE");
