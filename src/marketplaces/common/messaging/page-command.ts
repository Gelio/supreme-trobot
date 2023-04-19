import {
  type AppRequestHandler,
  createAppRequestResponsePair,
  createResponder,
} from "@app/messaging";

// NOTE: the return type is quire complex, thus, it's better left as is
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createPageCommandWithHandler = <
  Name extends string,
  R1D = void,
  R2D = void
>(
  name: Name
) => {
  const pair = createAppRequestResponsePair<Name, R1D, R2D>(name);

  return (handler: AppRequestHandler<typeof pair>) => ({
    pair,
    responder: createResponder(pair, handler),
  });
};
