import {
  type AppMessageDescription,
  createMessageDescription,
} from "../message-description";

/** A command with a response */
export interface AppRequestResponsePair<Name extends string, R1D, R2D> {
  request: AppMessageDescription<`${Name}/REQUEST`, R1D>;
  response: AppMessageDescription<`${Name}/RESPONSE`, R2D>;
}

export const createAppRequestResponsePair = <
  Name extends string,
  R1D = void,
  R2D = void
>(
  name: Name
): AppRequestResponsePair<Name, R1D, R2D> => ({
  request: createMessageDescription<R1D, `${Name}/REQUEST`>(
    `${name}/REQUEST` as const
  ),
  response: createMessageDescription<R2D, `${Name}/RESPONSE`>(
    `${name}/RESPONSE` as const
  ),
});
