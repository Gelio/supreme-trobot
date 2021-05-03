import { createAppRequestResponsePair } from "@app/messaging";

export const changePriceDriverCommand = createAppRequestResponsePair<
  "DRIVER/CHANGE_PRICE",
  { newPrice: string; offerEditUrl: string }
>("DRIVER/CHANGE_PRICE");
