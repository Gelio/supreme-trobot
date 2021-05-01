import type { Offer } from "@app/marketplaces/common/messaging";
import { createAppRequestResponsePair } from "@app/messaging";

export const executeWorkflow = createAppRequestResponsePair<
  "EXECUTE_WORKFLOW",
  void,
  Offer[]
>("EXECUTE_WORKFLOW");
