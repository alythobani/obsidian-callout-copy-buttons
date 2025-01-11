import classNames from "classnames";
import { createCopyButton } from "../copyButton";
import { getCalloutBodyTextFromInnerText } from "./getCalloutBodyText";

export function addCopyPlainTextButtonToCalloutDiv({
  calloutNode,
  isCMCalloutNode,
}: {
  calloutNode: HTMLElement;
  isCMCalloutNode: boolean;
}): void {
  if (calloutNode.querySelector(".callout-copy-button-plain-text") !== null) {
    console.warn("Copy button already exists; not adding another one", calloutNode);
    return;
  }
  console.log("Adding copy plain text button to callout", calloutNode);
  addCopyButtonToCallout({
    calloutNode,
    getCalloutBodyText: () => getCalloutBodyTextFromInnerText(calloutNode),
    tooltipText: "Copy (plain text)",
    buttonClassName: "callout-copy-button-plain-text",
    isCMCalloutNode,
  });
}

export function addCopyButtonToCallout({
  calloutNode,
  getCalloutBodyText,
  tooltipText,
  buttonClassName,
  isCMCalloutNode,
}: {
  calloutNode: HTMLElement;
  getCalloutBodyText: () => string;
  tooltipText: string;
  buttonClassName?: string | undefined;
  isCMCalloutNode: boolean;
}): void {
  const copyButton = createCopyButton({
    getCalloutBodyText,
    className: classNames("callout-copy-button", buttonClassName),
    tooltipText,
  });
  const actionButtonsWrapper = getOrCreateCalloutActionButtonsWrapper({
    calloutNode,
    isCMCalloutNode,
  });
  actionButtonsWrapper.appendChild(copyButton);
}

export function moveEditBlockButtonToCalloutActionButtonsWrapper(calloutNode: HTMLElement): void {
  const closestCMCallout = calloutNode.closest<HTMLElement>(".cm-callout");
  if (closestCMCallout === null) {
    console.warn("CM callout not found; not moving edit block button", calloutNode);
    return;
  }
  console.log("Closest CM callout:", closestCMCallout);
  console.dir(closestCMCallout);
  const editBlockButton = closestCMCallout.querySelector(".edit-block-button");
  console.log("Edit block button", closestCMCallout.querySelector(".edit-block-button"));
  if (editBlockButton === null) {
    console.warn("Edit block button not found; not moving it", closestCMCallout);
    return;
  }
  const actionButtonsWrapper = getOrCreateCalloutActionButtonsWrapper({
    calloutNode: closestCMCallout,
    isCMCalloutNode: true,
  });
  if (actionButtonsWrapper.contains(editBlockButton)) {
    console.warn("Edit block button already in action buttons wrapper; not moving it");
    return;
  }
  actionButtonsWrapper.appendChild(editBlockButton);
}

function getOrCreateCalloutActionButtonsWrapper({
  calloutNode,
  isCMCalloutNode,
}: {
  calloutNode: HTMLElement;
  isCMCalloutNode: boolean;
}): HTMLElement {
  const existingCalloutActionButtonsWrapper = getCalloutActionButtonsWrapper({
    calloutNode,
    isCMCalloutNode,
  });
  if (existingCalloutActionButtonsWrapper !== null) {
    console.log("Action buttons wrapper already exists", existingCalloutActionButtonsWrapper);
    return existingCalloutActionButtonsWrapper;
  }
  return addCalloutActionButtonsWrapperToCalloutNode({ calloutNode, isCMCalloutNode });
}

function getCalloutActionButtonsWrapper({
  calloutNode,
  isCMCalloutNode,
}: {
  calloutNode: HTMLElement;
  isCMCalloutNode: boolean;
}): HTMLElement | null {
  if (!isCMCalloutNode) {
    return getFirstDirectChildWithClass(calloutNode, "callout-action-buttons");
  }
  const calloutDiv = calloutNode.querySelector<HTMLDivElement>(".callout");
  if (calloutDiv === null) {
    return null;
  }
  return getFirstDirectChildWithClass(calloutDiv, "callout-action-buttons");
}

function getFirstDirectChildWithClass(parent: HTMLElement, className: string): HTMLElement | null {
  for (const child of parent.children) {
    if (child instanceof HTMLElement && child.classList.contains(className)) {
      return child;
    }
  }
  return null;
}

function addCalloutActionButtonsWrapperToCalloutNode({
  calloutNode,
  isCMCalloutNode,
}: {
  calloutNode: HTMLElement;
  isCMCalloutNode: boolean;
}): HTMLDivElement {
  const calloutActionButtonsWrapper = document.createElement("div");
  calloutActionButtonsWrapper.classList.add("callout-action-buttons");
  if (!isCMCalloutNode) {
    console.log("Not a CM callout; adding action buttons wrapper to callout", calloutNode);
    calloutNode.appendChild(calloutActionButtonsWrapper);
    return calloutActionButtonsWrapper;
  }
  const calloutDiv = calloutNode.querySelector(".callout");
  if (calloutDiv === null) {
    console.warn("Callout div not found; not adding action buttons wrapper", calloutNode);
    return calloutActionButtonsWrapper;
  }
  console.log("Adding action buttons wrapper to callout", calloutNode, calloutDiv);
  calloutDiv.appendChild(calloutActionButtonsWrapper);
  return calloutActionButtonsWrapper;
}
