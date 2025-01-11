import {
  addCopyPlainTextButtonToCalloutDiv,
  moveEditBlockButtonToCalloutActionButtonsWrapper,
} from "./utils/addCopyButtonToCallout";

export function watchAndAddCopyButtonsToDOM(): MutationObserver {
  const observer = watchDOMForNewCallouts();
  addAllCopyButtons();
  return observer;
}

function watchDOMForNewCallouts(): MutationObserver {
  const observer = getCalloutDivObserver();
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

function getCalloutDivObserver(): MutationObserver {
  return new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        const newCMCalloutNodes = node.querySelectorAll<HTMLDivElement>(".cm-callout");
        for (const calloutNode of newCMCalloutNodes) {
          addCopyPlainTextButtonAndMoveEditBlockButton({ calloutNode, isCMCalloutNode: true });
        }
        const newCalloutNodes = node.querySelectorAll<HTMLDivElement>(".callout");
        for (const calloutNode of newCalloutNodes) {
          addCopyPlainTextButtonAndMoveEditBlockButton({ calloutNode, isCMCalloutNode: false });
        }
      });
    });
  });
}

function addAllCopyButtons(): void {
  const cmCalloutNodes = document.querySelectorAll<HTMLElement>(".cm-callout");
  cmCalloutNodes.forEach((calloutNode) =>
    addCopyPlainTextButtonAndMoveEditBlockButton({ calloutNode, isCMCalloutNode: true })
  );
  const calloutNodes = document.querySelectorAll<HTMLElement>(".callout");
  calloutNodes.forEach((calloutNode) =>
    addCopyPlainTextButtonAndMoveEditBlockButton({ calloutNode, isCMCalloutNode: false })
  );
}

function addCopyPlainTextButtonAndMoveEditBlockButton({
  calloutNode,
  isCMCalloutNode,
}: {
  calloutNode: HTMLElement;
  isCMCalloutNode: boolean;
}): void {
  addCopyPlainTextButtonToCalloutDiv({ calloutNode, isCMCalloutNode });
  moveEditBlockButtonToCalloutActionButtonsWrapper(calloutNode);
}
