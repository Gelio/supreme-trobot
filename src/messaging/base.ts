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
