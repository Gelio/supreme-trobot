import { either, io, task, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { Observable, take } from "rxjs";

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

/**
 * Extracts the first value from an observable.
 * Unsubscribes from the observable if the cancellation signal occurs.
 */
export const fromObservable =
  <Reason, T>(
    signal: CancellationSignal<Reason>,
    observable: Observable<T>
  ): task.Task<Cancellable<Reason, T>> =>
  () =>
    new Promise((resolve) => {
      const singleEmissionObservable = observable.pipe(take(1));

      const subscription = singleEmissionObservable.subscribe({
        next: (value) => {
          resolve(either.right(value));
        },
        error: () => {
          // no-op, expect all errors to be handled in another way
        },
        complete: () => {
          console.error(
            "Observable completed without emitting a result. Cannot continue the Task chain."
          );
        },
      });

      void signal().then((reason) => {
        subscription.unsubscribe();
        resolve(either.left(reason));
      });
    });
