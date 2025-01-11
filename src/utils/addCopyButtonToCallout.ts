import classNames from "classnames";
import { createCopyButton } from "../copyButton";
import { getCalloutBodyTextFromInnerText } from "./getCalloutBodyText";

export function addCopyPlainTextButtonToCallout({
  calloutNode,
}: {
  calloutNode: HTMLElement;
}): void {
  console.log("Adding copy plain text button to callout", calloutNode);
  if (calloutNode.querySelector(".callout-copy-button-plain-text")) {
    console.warn("Copy button already exists; not adding another one", calloutNode);
    return;
  }
  addCopyButtonToCallout({
    calloutNode,
    getCalloutBodyText: () => getCalloutBodyTextFromInnerText(calloutNode),
    tooltipText: "Copy (plain text)",
    buttonClassName: "callout-copy-button-plain-text",
  });
}

export function addCopyButtonToCallout({
  calloutNode,
  getCalloutBodyText,
  tooltipText,
  buttonClassName,
}: {
  calloutNode: HTMLElement;
  getCalloutBodyText: () => string;
  tooltipText: string;
  buttonClassName?: string | undefined;
}): void {
  const codeMirrorCalloutNode = calloutNode.closest(".cm-callout");

  const isLivePreview = codeMirrorCalloutNode !== null;
  if (isLivePreview) {
    console.log("Adding copy button to live preview CM callout", codeMirrorCalloutNode);
    addCopyButtonToLivePreviewCallout({
      calloutNode,
      getCalloutBodyText,
      codeMirrorCalloutNode,
      tooltipText,
      buttonClassName,
    });
    return;
  }
  console.log("Adding copy button to reading mode callout", calloutNode);
  addCopyButtonToReadingModeCallout({
    calloutNode,
    getCalloutBodyText,
    tooltipText,
    buttonClassName,
  });
}

function addCopyButtonToLivePreviewCallout({
  calloutNode,
  getCalloutBodyText,
  tooltipText,
  codeMirrorCalloutNode,
  buttonClassName,
}: {
  calloutNode: HTMLElement;
  getCalloutBodyText: () => string;
  tooltipText: string;
  /** Parent div of the callout in the CodeMirror editor */
  codeMirrorCalloutNode: Element;
  buttonClassName?: string | undefined;
}): void {
  const calloutTitleDiv = calloutNode.querySelector(".callout-title");
  if (calloutTitleDiv === null) {
    console.warn("Callout title div not found; not adding copy button", calloutNode);
    return;
  }
  const copyButton = createCopyButton({
    getCalloutBodyText,
    className: classNames("callout-copy-button-live-preview", buttonClassName),
    tooltipText,
  });
  const editBlockButton = codeMirrorCalloutNode.querySelector(".edit-block-button");

  if (editBlockButton === null) {
    // TODO: Add copy button even if edit block button is not found
    console.warn("Edit block button not found; not adding copy button", calloutNode);
    return;
  }

  addCopyButtonBesideEditBlockButton({ calloutTitleDiv, copyButton, editBlockButton });
}

function addCopyButtonBesideEditBlockButton({
  calloutTitleDiv,
  copyButton,
  editBlockButton,
}: {
  calloutTitleDiv: Element;
  copyButton: HTMLDivElement;
  editBlockButton: Element;
}): void {
  const calloutActionButtonsWrapper = document.createElement("div");
  calloutActionButtonsWrapper.classList.add("callout-action-buttons");
  calloutActionButtonsWrapper.appendChild(editBlockButton);
  calloutActionButtonsWrapper.appendChild(copyButton);
  calloutTitleDiv.appendChild(calloutActionButtonsWrapper);
}

function addCopyButtonToReadingModeCallout({
  calloutNode,
  getCalloutBodyText,
  tooltipText,
  buttonClassName,
}: {
  calloutNode: HTMLElement;
  getCalloutBodyText: () => string;
  tooltipText: string;
  buttonClassName?: string | undefined;
}): void {
  const copyButton = createCopyButton({
    getCalloutBodyText,
    className: classNames("callout-copy-button-reading-mode", buttonClassName),
    tooltipText,
  });
  calloutNode.style.position = "relative";
  calloutNode.appendChild(copyButton);
}
