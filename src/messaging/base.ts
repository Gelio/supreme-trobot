export interface AppMessage<T extends string = string, Data = unknown> {
  type: T;
  data: Data;
}

export type AppErrorMessage<E = unknown> = AppMessage<"ERROR", E>;
