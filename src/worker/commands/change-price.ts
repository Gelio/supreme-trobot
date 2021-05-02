import { createAppRequestResponsePair } from "@app/messaging";

export const changePriceCommand = createAppRequestResponsePair<
  "CHANGE_PRICE",
  { newPrice: string; offerEditUrl: string }
>("CHANGE_PRICE");
