import { Action, createStore as createReduxStore, Reducer } from "redux";

import type { Offer } from "@app/marketplaces/common/messaging";
import { createMessageDescription } from "@app/messaging";

export interface WorkerState {
  status: WorkerStatus;
  offers?: Offer[];
}

export type WorkerStatus = { type: "idle" } | { type: "working" };

export const workerStateUpdatedMessage = createMessageDescription<WorkerState>(
  "WORKER_STATE_UPDATED"
);

type StateUpdateAction = Action<"UPDATE"> & { payload: Partial<WorkerState> };
export const updateState = (
  update: StateUpdateAction["payload"]
): StateUpdateAction => ({
  type: "UPDATE",
  payload: update,
});

const initialState: WorkerState = { status: { type: "idle" } };
const stateReducer: Reducer<WorkerState, StateUpdateAction> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// NOTE: the type is lengthy and quite long
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createStore = () => createReduxStore(stateReducer);
