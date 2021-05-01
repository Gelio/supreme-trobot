import type { Offer } from "@app/marketplaces/common/messaging";
import { createMessageDescription } from "@app/messaging";

export interface WorkerState {
  status: WorkerStatus;
  offers?: Offer[];
}

export type WorkerStatus = { type: "idle" } | { type: "working" };

export const workerStateUpdatedMessage = createMessageDescription<WorkerState>(
  "worker state updated"
);
