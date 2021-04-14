import type { AppMessage, AppMessageFactory } from "./base";

export interface AppMessageDescription<T extends string, Data> {
  type: T;
  create: AppMessageFactory<T, Data>;
  is: (message: AppMessage) => message is AppMessage<T, Data>;
}

export const createMessageDescription = <
  Data = unknown,
  T extends string = string
>(
  type: T
): AppMessageDescription<T, Data> => ({
  create: ((data) => ({
    type,
    data,
  })) as AppMessageFactory<T, Data>,
  type,
  is: (message): message is AppMessage<T, Data> => message.type === type,
});

/** Retrieves the `AppMessage` type from an existing message description */
export type MessageFromDescription<
  D extends AppMessageDescription<string, any>
> = D extends AppMessageDescription<infer T, infer Data>
  ? AppMessage<T, Data>
  : never;
