import { addCopyPlainTextButtonToCallout } from "./utils/addCopyButtonToCallout";

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
        const newCalloutNodes = node.querySelectorAll<HTMLDivElement>(".callout");
        [...newCMCalloutNodes, ...newCalloutNodes].forEach((calloutNode) =>
          addCopyPlainTextButtonToCallout({ calloutNode })
        );
      });
    });
  });
}

function addAllCopyButtons(): void {
  document
    .querySelectorAll<HTMLElement>(".callout")
    .forEach((calloutNode) => addCopyPlainTextButtonToCallout({ calloutNode }));
}
