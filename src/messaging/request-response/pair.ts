import {
  AppMessageDescription,
  createMessageDescription,
} from "../message-description";

/** A command with a response */
export interface AppRequestResponsePair<
  R1T extends string,
  R1D,
  R2T extends string,
  R2D
> {
  request: AppMessageDescription<R1T, R1D>;
  response: AppMessageDescription<R2T, R2D>;
}

export const createAppRequestResponsePair = <
  Name extends string,
  R1D = void,
  R2D = void
>(
  name: Name
): AppRequestResponsePair<`${Name}/REQUEST`, R1D, `${Name}/RESPONSE`, R2D> => ({
  request: createMessageDescription<R1D, `${Name}/REQUEST`>(
    `${name}/REQUEST` as const
  ),
  response: createMessageDescription<R2D, `${Name}/RESPONSE`>(
    `${name}/RESPONSE` as const
  ),
});
