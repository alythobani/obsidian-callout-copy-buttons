import { type PluginSettingsManager } from "./settings";
import {
  addCopyPlainTextButtonToCalloutDiv,
  moveEditBlockButtonToCalloutActionButtonsWrapper,
} from "./utils/addCopyButtonToCallout";

export function watchAndAddCopyButtonsToDOM({
  pluginSettingsManager,
}: {
  pluginSettingsManager: PluginSettingsManager;
}): MutationObserver {
  const observer = watchDOMForNewCallouts(pluginSettingsManager);
  addAllCopyButtons(pluginSettingsManager);
  return observer;
}

function watchDOMForNewCallouts(pluginSettingsManager: PluginSettingsManager): MutationObserver {
  const observer = getCalloutDivObserver(pluginSettingsManager);
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

function getCalloutDivObserver(pluginSettingsManager: PluginSettingsManager): MutationObserver {
  return new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        const newCMCalloutNodes = node.querySelectorAll<HTMLDivElement>(".cm-callout");
        for (const calloutNode of newCMCalloutNodes) {
          addCopyPlainTextButtonAndMoveEditBlockButton({
            calloutNode,
            isCMCalloutNode: true,
            pluginSettingsManager,
          });
        }
        const newCalloutNodes = node.querySelectorAll<HTMLDivElement>(".callout");
        for (const calloutNode of newCalloutNodes) {
          addCopyPlainTextButtonAndMoveEditBlockButton({
            calloutNode,
            isCMCalloutNode: false,
            pluginSettingsManager,
          });
        }
      });
    });
  });
}

function addAllCopyButtons(pluginSettingsManager: PluginSettingsManager): void {
  const cmCalloutNodes = document.querySelectorAll<HTMLElement>(".cm-callout");
  cmCalloutNodes.forEach((calloutNode) =>
    addCopyPlainTextButtonAndMoveEditBlockButton({
      calloutNode,
      isCMCalloutNode: true,
      pluginSettingsManager,
    })
  );
  const calloutNodes = document.querySelectorAll<HTMLElement>(".callout");
  calloutNodes.forEach((calloutNode) =>
    addCopyPlainTextButtonAndMoveEditBlockButton({
      calloutNode,
      isCMCalloutNode: false,
      pluginSettingsManager,
    })
  );
}

function addCopyPlainTextButtonAndMoveEditBlockButton({
  calloutNode,
  isCMCalloutNode,
  pluginSettingsManager,
}: {
  calloutNode: HTMLElement;
  isCMCalloutNode: boolean;
  pluginSettingsManager: PluginSettingsManager;
}): void {
  addCopyPlainTextButtonToCalloutDiv({ calloutNode, isCMCalloutNode, pluginSettingsManager });
  moveEditBlockButtonToCalloutActionButtonsWrapper(calloutNode);
}
