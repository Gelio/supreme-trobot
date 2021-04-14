import type { AppMessageDescription } from "../message-description";

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
  R1T extends string,
  R1D,
  R2T extends string,
  R2D
>(
  pair: AppRequestResponsePair<R1T, R1D, R2T, R2D>
) => pair;
