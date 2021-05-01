export interface AppMessage<T extends string = string, Data = unknown> {
  type: T;
  data: Data;
}

export type ErrorMessage<E = unknown> = AppMessage<"error", E>;

export type AppMessageFactory<T extends string, Data> = (
  data: Data
) => AppMessage<T, Data>;
