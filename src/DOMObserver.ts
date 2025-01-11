import { addCopyButtonToCallout } from "./utils/addCopyButtonToCallout";
import { getCalloutBodyTextFromInnerText } from "./utils/getCalloutBodyText";

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
          addCopyButtonToCallout({
            calloutNode,
            getCalloutBodyText: () => getCalloutBodyTextFromInnerText(calloutNode),
            tooltipText: "Copy (plain text)",
            buttonClassName: "callout-copy-button-plain-text",
          })
        );
      });
    });
  });
}

function addAllCopyButtons(): void {
  document.querySelectorAll(".callout").forEach((calloutNode) => {
    if (calloutNode instanceof HTMLElement) {
      addCopyButtonToCallout({
        calloutNode,
        getCalloutBodyText: () => getCalloutBodyTextFromInnerText(calloutNode),
        tooltipText: "Copy (plain text)",
      });
    }
  });
}
