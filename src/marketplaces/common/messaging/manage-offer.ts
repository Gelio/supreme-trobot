import { createAppRequestResponsePair } from "@app/messaging";

export const changePriceCommand = createAppRequestResponsePair<
  "CHANGE_PRICE",
  { newPrice: string }
>("CHANGE_PRICE");

export const saveChangesCommand = createAppRequestResponsePair<"SAVE_CHANGES">(
  "SAVE_CHANGES"
);

export const verifyPriceChangedCommand = createAppRequestResponsePair<
  "VERIFY_PRICE_CHANGED",
  { price: string }
>("VERIFY_PRICE_CHANGED");
