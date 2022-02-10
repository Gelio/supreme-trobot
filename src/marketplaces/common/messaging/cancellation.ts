import { apply, either, io, nonEmptyArray, task, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";

export type Cancellable<Reason, T> = either.Either<Reason, T>;
export type CancellationSignal<Reason> = task.Task<Reason>;

export const getCancellationContext = <Reason>(): {
  cancel: (reason: Reason) => io.IO<void>;
  /** Task that resolves with `Reason` if the operation should be cancelled. */
  cancellationSignal: CancellationSignal<Reason>;
} => {
  let resolvePromise: ((reason: Reason) => void) | undefined = undefined;
  const cancelledPromise = new Promise<Reason>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    cancel: (reason) => () => {
      resolvePromise?.(reason);
    },
    cancellationSignal: () => cancelledPromise,
  };
};

export const cancelOnSignal =
  <CancelReason>(signal: CancellationSignal<CancelReason>) =>
  <T>(t: task.Task<T>): task.Task<Cancellable<CancelReason, T>> =>
    task
      .getRaceMonoid<Cancellable<CancelReason, T>>()
      .concat(
        pipe(signal, task.map(either.left)),
        pipe(t, task.map(either.right))
      );

export const cancellableChainK =
  <Reason, A, B>(
    signal: CancellationSignal<Reason>,
    f: (a: A) => task.Task<B>
  ) =>
  (fa: task.Task<Cancellable<Reason, A>>): task.Task<Cancellable<Reason, B>> =>
    pipe(
      fa,
      taskEither.chain((a) => cancelOnSignal(signal)(f(a)))
    );
