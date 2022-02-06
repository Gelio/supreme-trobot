export interface AppMessage<T extends string = string, Data = unknown> {
  type: T;
  data: Data;
}

export type AppErrorMessage<E = unknown> = AppMessage<"ERROR", E>;

/**
 * Workaround for type-only files in snowpack
 * @see https://github.com/withastro/snowpack/discussions/1589#discussioncomment-130176
 */
export {};
