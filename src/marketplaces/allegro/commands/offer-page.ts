import type { AppRequestResponder } from "@app/messaging";
import type { changePriceMessage } from "../../common/messaging/manage-offer";

const priceSelector = 'input#cena[name="price"]';

export const changePrice: AppRequestResponder<typeof changePriceMessage> = ({
  data: { newPrice },
}) => {
  const priceInput = document.querySelector<HTMLInputElement>(priceSelector);
  if (!priceInput) {
    throw new Error("Cannot find price input");
  }

  priceInput.value = newPrice;
};
