import type { AppMessage } from "./base";

export interface AppMessageDescription<Type extends string, Data> {
  type: Type;
  create: (data: Data) => AppMessage<Type, Data>;
  is: (message: AppMessage) => message is AppMessage<Type, Data>;
}

export const createMessageDescription = <
  // NOTE: order of generic parameters allows easily specifying the Data and inferring the Type
  Data = void,
  Type extends string = string
>(
  type: Type
): AppMessageDescription<Type, Data> => ({
  create: (data: Data) => ({
    type,
    data,
  }),
  type,
  is: (message): message is AppMessage<Type, Data> => message.type === type,
});

/** Retrieves the `AppMessage` type from an existing message description */
export type MessageFromDescription<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Desc extends AppMessageDescription<string, any>
> = Desc extends AppMessageDescription<infer Type, infer Data>
  ? AppMessage<Type, Data>
  : never;
