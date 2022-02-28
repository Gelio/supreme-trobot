import { updateTabTask, withNewTab } from "@app/chrome-facade";
import {
  executeCommand,
  ExecuteCommandError,
  Offer,
  waitForTabToBeReady,
} from "@app/marketplaces/common/messaging";
import {
  cancellableTask,
  cancellableTaskEither,
} from "@app/marketplaces/common/messaging/cancellation-module";
import { array, either, eitherT, task, taskEither } from "fp-ts";
import { sequenceT } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import {
  getSingleOffersPagePageCommand,
  goToNextPagePageCommand,
} from "../page/commands";

const offersPageUrl = "https://allegrolokalnie.pl/konto/oferty/aktywne";

const withNewTabAtUrl = <CancellationReason, T>(
  url: string,
  properties: chrome.tabs.CreateProperties,
  cancellationSignal: cancellableTask.CancellationSignal<CancellationReason>,
  callback: (
    tabId: number
  ) => task.Task<cancellableTask.Cancellable<CancellationReason, T>>
): task.Task<cancellableTask.Cancellable<CancellationReason, T>> =>
  withNewTab(properties, (tabId) =>
    pipe(
      sequenceT(taskEither.ApplyPar)(
        waitForTabToBeReady(tabId, cancellationSignal),
        pipe(
          updateTabTask(tabId, { url }),
          task.map(() => either.right(undefined))
        )
      ),
      taskEither.map(() => tabId),
      taskEither.chain(callback)
    )
  );

export const getOffersWorkflow = <Reason>(
  focusNewTab: boolean,
  cancellationSignal: cancellableTask.CancellationSignal<Reason>
): cancellableTaskEither.CancellableTaskEither<
  Reason,
  ExecuteCommandError,
  Offer[]
> =>
  withNewTabAtUrl(
    offersPageUrl,
    { active: focusNewTab },
    cancellationSignal,
    (tabId) =>
      pipe(
        executeCommand({
          tabId,
          cancellationSignal,
          requestResponsePair: getSingleOffersPagePageCommand.pair,
          requestData: undefined,
        }),
        eitherT.chain(taskEither.Monad)((firstPageResponse) =>
          pipe(
            array.sequence(cancellableTaskEither.ApplicativeSeq)([
              cancellableTaskEither.ApplicativeSeq.of(firstPageResponse),
              ...array.makeBy(firstPageResponse.data.totalPages - 1, () =>
                pipe(
                  waitForTabToBeReady(tabId, cancellationSignal),
                  task.apFirst(
                    task.fromIO(() => {
                      const port = chrome.tabs.connect(tabId);
                      port.postMessage(
                        goToNextPagePageCommand.pair.request.create()
                      );
                    })
                  ),
                  taskEither.chain(() =>
                    executeCommand({
                      tabId,
                      cancellationSignal,
                      requestResponsePair: getSingleOffersPagePageCommand.pair,
                      requestData: undefined,
                    })
                  )
                )
              ),
            ]),
            cancellableTaskEither.map(
              array.chain((response) => response.data.offers)
            )
          )
        )
      )
  );
