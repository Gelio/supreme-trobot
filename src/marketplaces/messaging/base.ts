export interface AppMessage<T extends string = string, Data = unknown> {
  type: T;
  data: Data;
}

export type ErrorMessage<E = unknown> = AppMessage<"error", E>;

// NOTE: checking equality with `never` is troublesome.
// See https://github.com/microsoft/TypeScript/issues/23182#issuecomment-379091887
export type AppMessageFactory<T extends string, Data> = [Data] extends [never]
  ? () => AppMessage<T, Data>
  : (data: Data) => AppMessage<T, Data>;

export interface AppMessageDescription<T extends string, Data> {
  type: T;
  make: AppMessageFactory<T, Data>;
  is: (message: AppMessage) => message is AppMessage<T, Data>;
}

export const createMessageDescription = <
  Data = unknown,
  T extends string = string
>(
  type: T
): AppMessageDescription<T, Data> => ({
  make: ((data) => ({
    type,
    data,
  })) as AppMessageFactory<T, Data>,
  type,
  is: (message): message is AppMessage<T, Data> => message.type === type,
});
