export interface AppMessage<T extends string = string, Data = unknown> {
  type: T;
  data: Data;
}

export type ErrorMessage<E = unknown> = AppMessage<"error", E>;

export interface OfferInfo {
  title: string;
  // TODO: parse price to be a number
  price: string;
  editUrl: string;
}

// NOTE: checking equality with `never` is troublesome.
// See https://github.com/microsoft/TypeScript/issues/23182#issuecomment-379091887
type AppMessageFactory<T extends string, Data> = [Data] extends [never]
  ? () => AppMessage<T, Data>
  : (data: Data) => AppMessage<T, Data>;

interface AppMessageDescription<T extends string, Data> {
  type: T;
  make: AppMessageFactory<T, Data>;
  is: (message: AppMessage) => message is AppMessage<T, Data>;
}

const createMessageDescription = <Data = unknown, T extends string = string>(
  type: T
): AppMessageDescription<T, Data> => ({
  make: ((data) => ({
    type,
    data,
  })) as AppMessageFactory<T, Data>,
  type,
  is: (message): message is AppMessage<T, Data> => message.type === type,
});

const createAppMessagePair = <
  R1T extends string,
  R1D,
  R2T extends string,
  R2D
>({
  request,
  response,
}: {
  request: AppMessageDescription<R1T, R1D>;
  response: AppMessageDescription<R2T, R2D>;
}) => ({ request, response });

export type GetOffersInfoMessage = AppMessage<"get offers info", OfferInfo[]>;
export const getOffersInfoMessage = createAppMessagePair({
  request: createMessageDescription<never>("get offers info"),
  response: createMessageDescription<OfferInfo[]>("get offers info response"),
});
