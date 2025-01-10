import { type MarkdownPostProcessorContext, Plugin } from "obsidian";
import { createCopyButton } from "./copyButton";
import {
  getCalloutBodyTextFromInnerText,
  getCalloutBodyTextFromSectionInfo,
} from "./utils/getCalloutBodyText";
import { calloutCopyButtonViewPlugin } from "./viewPlugin";

export default class CalloutCopyButtonPlugin extends Plugin {
  calloutDivObserver: MutationObserver | null = null;

  private logInfo(message: string): void {
    console.log(`${this.manifest.name}: ${message}`);
  }

  onload(): void {
    this.logInfo("Loading Callout Copy Button plugin");

    this.registerEditorExtension([calloutCopyButtonViewPlugin]);

    this.watchAndAddCopyButtonsToDOM();

    this.registerMarkdownPostProcessor(this.postProcessMarkdown.bind(this));
  }

  private watchAndAddCopyButtonsToDOM(): void {
    this.watchDOMForNewCallouts();
    this.addAllCopyButtons();
  }

  private watchDOMForNewCallouts(): void {
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
          const newCMCalloutNodes = node.querySelectorAll<HTMLDivElement>(".cm-callout");
          const newCalloutNodes = node.querySelectorAll<HTMLDivElement>(".callout");
          console.log("New CM callout nodes", newCMCalloutNodes);
          console.log("New callout nodes", newCalloutNodes);
          [...newCMCalloutNodes, ...newCalloutNodes].forEach((calloutNode) =>
            this.addCopyButtonToCallout({
              calloutNode,
              getCalloutBodyText: () => getCalloutBodyTextFromInnerText(calloutNode),
            })
          );
        });
      });
    });
  }

  private addAllCopyButtons(): void {
    document.querySelectorAll(".callout").forEach((calloutNode) => {
      if (calloutNode instanceof HTMLElement) {
        this.addCopyButtonToCallout({
          calloutNode,
          getCalloutBodyText: () => getCalloutBodyTextFromInnerText(calloutNode),
        });
      }
    });
  }

  private addCopyButtonToCallout({
    calloutNode,
    getCalloutBodyText,
  }: {
    calloutNode: HTMLElement;
    getCalloutBodyText: () => string;
  }): void {
    console.log("Adding copy button to callout", calloutNode);
    if (calloutNode.querySelector(".callout-copy-button")) {
      // Copy button already exists
      console.log("Copy button already exists; not adding another one", calloutNode);
      return;
    }

    const codeMirrorCalloutNode = calloutNode.closest(".cm-callout");

    const isLivePreview = codeMirrorCalloutNode !== null;
    if (isLivePreview) {
      console.log("Adding copy button to live preview CM callout", codeMirrorCalloutNode);
      this.addCopyButtonToLivePreviewCallout({
        calloutNode,
        getCalloutBodyText,
        codeMirrorCalloutNode,
      });
      return;
    }
    console.log("Adding copy button to reading mode callout", calloutNode);
    this.addCopyButtonToReadingModeCallout({ calloutNode, getCalloutBodyText });
  }

  private addCopyButtonToLivePreviewCallout({
    calloutNode,
    getCalloutBodyText,
    codeMirrorCalloutNode,
  }: {
    calloutNode: HTMLElement;
    getCalloutBodyText: () => string;
    /** Parent div of the callout in the CodeMirror editor */
    codeMirrorCalloutNode: Element;
  }): void {
    const calloutTitleDiv = calloutNode.querySelector(".callout-title");
    if (calloutTitleDiv === null) {
      console.warn("Callout title div not found; not adding copy button", calloutNode);
      return;
    }
    const copyButton = createCopyButton({
      getCalloutBodyText,
      className: "callout-copy-button-live-preview",
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

  private addCopyButtonToReadingModeCallout({
    calloutNode,
    getCalloutBodyText,
  }: {
    calloutNode: HTMLElement;
    getCalloutBodyText: () => string;
  }): void {
    const copyButton = createCopyButton({
      getCalloutBodyText,
      className: "callout-copy-button-reading-mode",
    });
    calloutNode.style.position = "relative";
    calloutNode.appendChild(copyButton);
  }

  private postProcessMarkdown(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    console.log("Post-processing markdown", el);
    const calloutNodes = el.findAll(".callout");
    calloutNodes.forEach((calloutNode) => {
      console.log("Processing callout node", calloutNode);
      this.addCopyButtonToCallout({
        calloutNode,
        getCalloutBodyText: () => {
          const calloutSectionInfo = ctx.getSectionInfo(calloutNode);
          if (calloutSectionInfo === null) {
            console.warn("Callout section info not found, can't get callout body text");
            return "";
          }
          console.log("Callout section info", calloutSectionInfo);
          const calloutBodyText = getCalloutBodyTextFromSectionInfo(calloutSectionInfo);
          if (calloutBodyText === null) {
            console.warn("Callout body text not found, can't get callout body text");
            return "";
          }

          return calloutBodyText;
        },
      });
    });
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
