import { Plugin } from "obsidian";
import { createCopyButton } from "./copyButton";
import { calloutCopyButtonViewPlugin } from "./viewPlugin";

export default class CalloutCopyButtonPlugin extends Plugin {
  calloutDivObserver: MutationObserver | null = null;

  private logInfo(message: string): void {
    console.log(`${this.manifest.name}: ${message}`);
  }

  onload(): void {
    this.logInfo("Loading Callout Copy Button plugin");
    this.registerEditorExtension([calloutCopyButtonViewPlugin]);
    this.watchForNewCallouts();
    this.addAllCopyButtons();
  }

  private watchForNewCallouts(): void {
    const observer = this.getCalloutDivObserver();
    observer.observe(document.body, { childList: true, subtree: true });
    this.calloutDivObserver = observer;
  }

  private getCalloutDivObserver(): MutationObserver {
    return new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }
          if (node.matches(".callout") || node.matches(".cm-callout")) {
            this.addCopyButtonToCallout(node);
          }
        });
      });
    });
  }

  private addAllCopyButtons(): void {
    document.querySelectorAll(".callout").forEach((callout) => {
      if (callout instanceof HTMLElement) {
        this.addCopyButtonToCallout(callout);
      }
    });
  }

  private addCopyButtonToCallout(calloutNode: HTMLElement): void {
    if (calloutNode.querySelector(".callout-copy-button")) {
      // Copy button already exists
      return;
    }

    console.log("Adding button to callout", calloutNode);

    const codeMirrorCalloutNode = calloutNode.closest(".cm-callout");

    const isLivePreview = codeMirrorCalloutNode !== null;
    if (isLivePreview) {
      this.addCopyButtonToLivePreviewCallout({ calloutNode, codeMirrorCalloutNode });
      return;
    }
    this.addCopyButtonToReadingModeCallout(calloutNode);
  }

  private addCopyButtonToLivePreviewCallout({
    calloutNode,
    codeMirrorCalloutNode,
  }: {
    calloutNode: HTMLElement;
    /** Parent div of the callout in the CodeMirror editor */
    codeMirrorCalloutNode: Element;
  }): void {
    const calloutTitleDiv = calloutNode.querySelector(".callout-title");
    if (calloutTitleDiv === null) {
      console.warn("Callout title div not found; not adding copy button", calloutNode);
      return;
    }
    const copyButton = createCopyButton({
      calloutNode,
      classNames: ["callout-copy-button-live-preview"],
    });
    const editBlockButton = codeMirrorCalloutNode.querySelector(".edit-block-button");

    if (editBlockButton === null) {
      // TODO: Add copy button even if edit block button is not found
      console.warn("Edit block button not found; not adding copy button", calloutNode);
      return;
    }

    this.addCopyButtonBesideEditBlockButton({ calloutTitleDiv, copyButton, editBlockButton });
  }

  private addCopyButtonBesideEditBlockButton({
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

  private addCopyButtonToReadingModeCallout(calloutNode: HTMLElement): void {
    const copyButton = createCopyButton({
      calloutNode,
      classNames: ["callout-copy-button-reading-mode"],
    });
    calloutNode.style.position = "relative";
    calloutNode.appendChild(copyButton);
  }

  onunload(): void {
    this.logInfo("Unloading Callout Copy Button plugin");
    this.removeCalloutCopyButtons();
    this.disconnectCalloutDivObserver();
  }

  private removeCalloutCopyButtons(): void {
    document.querySelectorAll(".callout-action-buttons").forEach((wrapper) => {
      const editBlockButton = wrapper.querySelector(".edit-block-button");
      this.moveEditBlockButtonOutOfWrapper(editBlockButton);
      console.log("Removing action buttons wrapper", wrapper);
      wrapper.remove();
    });
    document.querySelectorAll(".callout-copy-button").forEach((button) => {
      console.log("Removed copy button", button);
      button.remove();
    });
  }

  private moveEditBlockButtonOutOfWrapper(editBlockButton: Element | null): void {
    if (editBlockButton === null) {
      return;
    }
    const cmCalloutParent = getCodeMirrorCalloutParent(editBlockButton);
    if (cmCalloutParent === null) {
      return;
    }
    cmCalloutParent.appendChild(editBlockButton);
  }

  private disconnectCalloutDivObserver(): void {
    if (this.calloutDivObserver !== null) {
      this.calloutDivObserver.disconnect();
      this.calloutDivObserver = null;
    }
  }
}

function getCodeMirrorCalloutParent(node: Element): Element | null {
  return node.closest(".cm-callout");
}
