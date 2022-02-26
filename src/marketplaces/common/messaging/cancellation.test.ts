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
import {
  cancellableChainK,
  combineCancellableTasks,
  getCancellationContext,
  cancelOnSignal,
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

    // TODO: think about using Promise.all / Applicative

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

  it("should work with concurrent tasks", async () => {
    /**
     * When running multiple tasks concurrently (like `Promise.all`),
     * if one task fails, other tasks should be aborted, because the overall
     * computation fails.
     */

    const onFailureCancellationContext = getCancellationContext<void>();
    const getSuccessTask = flow(either.right, task.of);
    const getFailureTask = flow(either.left, task.of);

    let slowSuccessRan = false;
    let superFastSuccessRan = false;
    let fastFailureRan = false;

    const slowSuccess = pipe(
      cancelOnSignal(onFailureCancellationContext.cancellationSignal)(
        getSuccessTask(5)
      ),
      task.delay(100),
      cancellableChainK(
        onFailureCancellationContext.cancellationSignal,
        flow(
          task.of,
          task.chainFirstIOK(() => () => {
            slowSuccessRan = true;
          })
        )
      )
    );
    const superFastSuccess = pipe(
      cancelOnSignal(onFailureCancellationContext.cancellationSignal)(
        getSuccessTask(10)
      ),
      task.delay(1),
      cancellableChainK(
        onFailureCancellationContext.cancellationSignal,
        flow(
          task.of,
          task.chainFirstIOK(() => () => {
            superFastSuccessRan = true;
          })
        )
      )
    );
    const fastFailure = pipe(
      cancelOnSignal(onFailureCancellationContext.cancellationSignal)(
        getFailureTask(-1)
      ),
      task.delay(10),
      cancellableChainK(
        onFailureCancellationContext.cancellationSignal,
        flow(
          task.of,
          task.chainFirstIOK(() => () => {
            fastFailureRan = true;
          })
        )
      )
    );

    await combineCancellableTasks(
      onFailureCancellationContext.cancel,
      undefined as void,
      [slowSuccess, superFastSuccess, fastFailure]
    )();
    console.assert(fastFailureRan);
    console.assert(superFastSuccessRan);
    console.assert(!slowSuccessRan);
    console.log("ok!");
  });
});
