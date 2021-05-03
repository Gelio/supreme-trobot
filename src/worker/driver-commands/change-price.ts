import { createAppRequestResponsePair } from "@app/messaging";

export const changePriceDriverCommand = createAppRequestResponsePair<
  "DRIVER/CHANGE_PRICE",
  { newPrice: string; offerEditUrl: string, focusNewTab: boolean }
>("DRIVER/CHANGE_PRICE");
