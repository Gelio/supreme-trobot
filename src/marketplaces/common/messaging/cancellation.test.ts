import { expect } from "chai";
import {
  either,
  eitherT,
  io,
  option,
  task,
  taskEither,
  taskOption,
} from "fp-ts";
import { flow, pipe } from "fp-ts/function";
import { Observable, of } from "rxjs";
import {
  cancellableChainK,
  getCancellationContext,
  cancelOnSignal,
  fromObservable,
} from "./cancellation";

describe("cancellation", () => {
  it("feels right", async () => {
    const cancellationContext = getCancellationContext<void>();
    // NOTE: `runTask` is a cancellation point
    const runTask = cancelOnSignal(cancellationContext.cancellationSignal);

    const onProgress = (step: number) => {
      if (step === 6) {
        cancellationContext.cancel()();
      }
    };

    const reportProgress =
      (step: number): io.IO<void> =>
      () =>
        onProgress(step);

    const res = await pipe(
      runTask(task.fromIO(reportProgress(1))),
      taskEither.chain(() =>
        runTask(
          pipe(
            task.fromIO(reportProgress(2)),
            task.chainIOK(() => () => {
              console.log("Step 2!");
              return either.right(2);
            })
          )
        )
      ),
      eitherT.map(taskEither.Functor)((n) => n + 1),
      eitherT.chain(taskEither.Monad)((n) =>
        runTask(
          task.fromIO(
            pipe(
              reportProgress(3),
              io.apSecond(() => {
                console.log("Step 3!");
                return either.right(n * 2);
              })
            )
          )
        )
      ),

      cancellableChainK(
        cancellationContext.cancellationSignal,
        flow(
          taskEither.fromEither,
          taskEither.map((n) => n * 2),
          taskEither.apFirst(taskEither.fromIO(reportProgress(4)))
        )
      ),

      taskEither.apSecond(taskEither.of(option.of(2))),

      cancellableChainK(
        cancellationContext.cancellationSignal,
        flow(
          taskOption.fromOption,
          taskOption.map((n) => n * 2),
          task.apFirst(task.fromIO(reportProgress(5)))
        )
      ),

      // NOTE: allow running nested tasks and cancel them
      cancellableChainK(cancellationContext.cancellationSignal, (x) =>
        runTask(
          task.of(
            pipe(
              x,
              option.map((n) => n * 2)
            )
          )
        )
      ),
      task.map(either.flatten),

      // NOTE: clean up in case of cancellation
      taskEither.orLeft(() =>
        task.fromIO(() => {
          console.log("Workflow was cancelled!");
        })
      ),

      taskEither.chainFirstIOK(() => () => {
        console.log("I should not run if the workflow was cancelled");
      })
    )();

    console.log(res);
  });
});

describe("fromObservable", () => {
  it("should return the emitted element", async () => {
    const result = await fromObservable(task.never, of(1))();
    expect(result).to.deep.equal(either.right(1));
  });

  it("should cancel the subscription on cancellation signal", async () => {
    const cancellationContext = getCancellationContext<"cancelled">();

    let observersCount = 0;
    const observable = new Observable(() => {
      // NOTE: this observable never emits on purpose
      observersCount++;

      return () => {
        observersCount--;
      };
    });

    const resultPromise = fromObservable(
      cancellationContext.cancellationSignal,
      observable
    )();

    expect(observersCount).to.equal(1);
    cancellationContext.cancel("cancelled")();

    // NOTE: one more tick is required to all pending promise callbacks
    // and actually unsubscribe
    await new Promise((r) => r(undefined));

    expect(observersCount).to.equal(0);
    const result = await resultPromise;
    expect(result).to.deep.equal(either.left("cancelled"));
  });
});
