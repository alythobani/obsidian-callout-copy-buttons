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
        if (newCMCalloutNodes.length > 0) console.log("New CM callout nodes", newCMCalloutNodes);
        for (const calloutNode of newCMCalloutNodes) {
          addCopyPlainTextButtonToCalloutDiv({ calloutNode, isCMCalloutNode: true });
          moveEditBlockButtonToCalloutActionButtonsWrapper(calloutNode);
        }
        const newCalloutNodes = node.querySelectorAll<HTMLDivElement>(".callout");
        if (newCalloutNodes.length > 0) console.log("New non-CM callout nodes", newCalloutNodes);
        for (const calloutNode of newCalloutNodes) {
          addCopyPlainTextButtonToCalloutDiv({ calloutNode, isCMCalloutNode: false });
          moveEditBlockButtonToCalloutActionButtonsWrapper(calloutNode);
        }
      });
    });
  });
}

function addAllCopyButtons(): void {
  const cmCalloutNodes = document.querySelectorAll<HTMLElement>(".cm-callout");
  console.log("CM callout nodes", cmCalloutNodes);
  cmCalloutNodes.forEach((calloutNode) =>
    addCopyPlainTextButtonToCalloutDiv({ calloutNode, isCMCalloutNode: true })
  );
  const calloutNodes = document.querySelectorAll<HTMLElement>(".callout");
  console.log("Non-CM Callout nodes", calloutNodes);
  calloutNodes.forEach((calloutNode) =>
    addCopyPlainTextButtonToCalloutDiv({ calloutNode, isCMCalloutNode: false })
  );
}
