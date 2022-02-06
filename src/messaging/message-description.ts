import type { AppMessage } from "./base";

export interface AppMessageDescription<T extends string, Data> {
  type: T;
  create: (data: Data) => AppMessage<T, Data>;
  is: (message: AppMessage) => message is AppMessage<T, Data>;
}

export const createMessageDescription = <
  // NOTE: order of generic parameters allows easily specifying the Data and inferring T
  Data = void,
  T extends string = string
>(
  type: T
): AppMessageDescription<T, Data> => ({
  create: (data: Data) => ({
    type,
    data,
  }),
  type,
  is: (message): message is AppMessage<T, Data> => message.type === type,
});

/** Retrieves the `AppMessage` type from an existing message description */
export type MessageFromDescription<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends AppMessageDescription<string, any>
> = D extends AppMessageDescription<infer T, infer Data>
  ? AppMessage<T, Data>
  : never;
