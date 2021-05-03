import { createAppRequestResponsePair } from "@app/messaging";

export const changePricePageCommand = createAppRequestResponsePair<
  "PAGE/CHANGE_PRICE",
  { newPrice: string }
>("PAGE/CHANGE_PRICE");

export const saveChangesPageCommand = createAppRequestResponsePair<"PAGE/SAVE_CHANGES">(
  "PAGE/SAVE_CHANGES"
);

export const verifyPriceChangedPageCommand = createAppRequestResponsePair<
  "PAGE/VERIFY_PRICE_CHANGED",
  { price: string }
>("PAGE/VERIFY_PRICE_CHANGED");
