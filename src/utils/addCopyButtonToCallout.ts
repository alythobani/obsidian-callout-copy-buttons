import classNames from "classnames";
import { createCopyButton } from "../copyButton";
import { type PluginSettingsManager } from "../settings";
import { getCalloutBodyTextFromInnerText } from "./getCalloutBodyText";

export function addCopyPlainTextButtonToCalloutDiv({
  calloutNode,
  isCMCalloutNode,
  pluginSettingsManager,
}: {
  calloutNode: HTMLElement;
  isCMCalloutNode: boolean;
  pluginSettingsManager: PluginSettingsManager;
}): void {
  if (calloutNode.querySelector(".callout-copy-button-plain-text") !== null) {
    // Copy button already exists; not adding another one
    return;
  }
  addCopyButtonToCallout({
    calloutNode,
    getCalloutBodyText: () => getCalloutBodyTextFromInnerText(calloutNode),
    tooltipText: "Copy (plain text)",
    buttonClassName: "callout-copy-button-plain-text",
    isCMCalloutNode,
    pluginSettingsManager,
  });
}

export function addCopyButtonToCallout({
  calloutNode,
  getCalloutBodyText,
  tooltipText,
  buttonClassName,
  isCMCalloutNode,
  pluginSettingsManager,
}: {
  calloutNode: HTMLElement;
  getCalloutBodyText: () => string | null;
  tooltipText: string;
  buttonClassName?: string | undefined;
  isCMCalloutNode: boolean;
  pluginSettingsManager: PluginSettingsManager;
}): void {
  const settingsClassName = pluginSettingsManager.getCopyButtonSettingsClassName();
  const copyButton = createCopyButton({
    getCalloutBodyText,
    className: classNames("callout-copy-button", buttonClassName, settingsClassName),
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
    // CM callout not found; not moving edit block button
    return;
  }
  const editBlockButton = closestCMCallout.querySelector(".edit-block-button");
  if (editBlockButton === null) {
    // Edit block button not found; not moving it
    return;
  }
  const actionButtonsWrapper = getOrCreateCalloutActionButtonsWrapper({
    calloutNode: closestCMCallout,
    isCMCalloutNode: true,
  });
  if (actionButtonsWrapper.contains(editBlockButton)) {
    // Edit block button already in action buttons wrapper; not moving it
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
    // Action buttons wrapper already exists
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
    // Not a CM callout; adding action buttons wrapper to callout
    calloutNode.appendChild(calloutActionButtonsWrapper);
    return calloutActionButtonsWrapper;
  }
  const calloutDiv = calloutNode.querySelector(".callout");
  if (calloutDiv === null) {
    // Callout div not found; not adding action buttons wrapper
    return calloutActionButtonsWrapper;
  }
  calloutDiv.appendChild(calloutActionButtonsWrapper);
  return calloutActionButtonsWrapper;
}
