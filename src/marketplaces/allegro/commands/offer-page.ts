import type { AppRequestResponder } from "@app/messaging";
import type {
  changePriceCommand,
  saveChangesCommand,
  verifyPriceChangedCommand,
} from "../../common/messaging/manage-offer";

export const changePrice: AppRequestResponder<typeof changePriceCommand> = ({
  data: { newPrice },
}) => {
  const priceSelector = 'input#cena[name="price"]';
  const priceInput = document.querySelector<HTMLInputElement>(priceSelector);
  if (!priceInput) {
    throw new Error("Cannot find price input");
  }

  // See https://github.com/facebook/react/issues/11488#issuecomment-558874287
  // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-non-null-assertion
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )!.set;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  nativeInputValueSetter!.call(priceInput, newPrice);

  priceInput.dispatchEvent(new Event("input", { bubbles: true }));
};

export const saveChanges: AppRequestResponder<
  typeof saveChangesCommand
> = () => {
  const saveChangesButton = document.querySelector<HTMLElement>(
    'button[data-testid="offer-submit-button"]'
  );
  if (!saveChangesButton) {
    throw new Error("Cannot find the 'Save changes' button");
  }

  saveChangesButton.click();
};

export const verifyPriceChanged: AppRequestResponder<
  typeof verifyPriceChangedCommand
> = ({ data: { price } }) => {
  const offerPrice = document.querySelector('[data-testid="offer-price"]');
  if (!offerPrice) {
    throw new Error("Cannot find the offer's price");
  }

  if (!offerPrice.textContent?.includes(price)) {
    throw new Error("Offer's price does not match");
  }
};
