import type { Offer } from "@app/marketplaces/common/messaging";

import {
  createAppRequestResponsePair,
  createMessageDescription,
} from "@app/messaging";

export const executeWorkflow = createAppRequestResponsePair({
  request: createMessageDescription<never>("execute workflow"),
  response: createMessageDescription<Offer[]>("execute workflow response"),
});
