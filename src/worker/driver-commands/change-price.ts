import { createAppRequestResponsePair } from "@app/messaging";

export const changePriceDriverCommand = createAppRequestResponsePair<
  "CHANGE_PRICE",
  { newPrice: string; offerEditUrl: string }
>("CHANGE_PRICE");
