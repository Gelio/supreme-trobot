import {
  createAppRequestResponsePair,
  createMessageDescription,
} from "@app/messaging";

export const changePriceMessage = createAppRequestResponsePair({
  request: createMessageDescription<{ newPrice: string }>("change price"),
  response: createMessageDescription<void>("change price response"),
});
