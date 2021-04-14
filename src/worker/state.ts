import { createMessageDescription } from "@app/messaging";

export type WorkerState =
  | {
      type: "idle";
    }
  | { type: "working" };

export const workerStateUpdatedMessage = createMessageDescription<WorkerState>(
  "worker state updated"
);
