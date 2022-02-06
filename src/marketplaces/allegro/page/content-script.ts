import { tabReadyPageMessage } from "@app/marketplaces/common/messaging";
import { combineResponders, getPortMessage$ } from "@app/messaging";
import { either } from "fp-ts";
import { pipe } from "fp-ts/function";
import {
  changePricePageCommand,
  getSingleOffersPagePageCommand,
  goToNextPagePageCommand,
  saveChangesPageCommand,
  verifyPriceChangedPageCommand,
} from "./commands";

const respond = combineResponders(
  getSingleOffersPagePageCommand.responder,
  goToNextPagePageCommand.responder,
  changePricePageCommand.responder,
  saveChangesPageCommand.responder,
  verifyPriceChangedPageCommand.responder
);

chrome.runtime.onConnect.addListener((port) => {
  // TODO: validate port.sender.id (should match the extension ID)

  getPortMessage$(port).subscribe((messageResult) =>
    pipe(
      messageResult,
      either.match(
        (error) => {
          console.error("Error from Chrome port", error);
        },
        (message) => {
          console.log("Handling message", message);

          if (!respond(port, message)) {
            console.error(
              "Message was not handled by registered responders",
              message
            );
          }
        }
      )
    )
  );
});

chrome.runtime.sendMessage(tabReadyPageMessage.create());
