import { Plugin } from "obsidian";

export default class CalloutCopyButtonPlugin extends Plugin {
  calloutDivObserver: MutationObserver | null = null;

  private logInfo(message: string): void {
    console.log(`${this.manifest.name}: ${message}`);
  }

  onload(): void {
    this.logInfo("Loading Callout Copy Button plugin");
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
          if (node instanceof HTMLDivElement && node.matches(".cm-callout")) {
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
    console.log("Adding button to callout", calloutNode);

    if (calloutNode.querySelector(".callout-copy-button")) {
      // Copy button already exists
      return;
    }

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
    const calloutTitleDiv = calloutNode.querySelector("div.callout-title");
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
    copyButton: HTMLSpanElement;
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

function createCopyButton({
  calloutNode,
  classNames = [],
}: {
  calloutNode: HTMLElement;
  classNames?: string[];
}): HTMLSpanElement {
  const copyButton = document.createElement("span");
  copyButton.addClasses(["callout-copy-button", ...classNames]);
  copyButton.setAttribute("aria-label", "Copy");

  copyButton.innerHTML = copyButtonSVGText;

  copyButton.addEventListener("click", (e) => onCopyButtonClick({ e, calloutNode, copyButton }));
  return copyButton;
}

function onCopyButtonClick({
  e,
  calloutNode,
  copyButton,
}: {
  e: MouseEvent;
  calloutNode: HTMLElement;
  copyButton: HTMLSpanElement;
}): void {
  e.stopPropagation();
  const contentDiv = calloutNode.querySelector(".callout-content");
  if (contentDiv === null) {
    console.error("Callout content div not found; cannot copy", calloutNode);
    return;
  }
  const trimmedContent = contentDiv.textContent?.trim();
  navigator.clipboard
    .writeText(trimmedContent ?? "")
    .then(() => {
      console.log(`Copied: ${JSON.stringify(trimmedContent)}`);
      copyButton.innerHTML = "✔"; // Temporary feedback
      copyButton.addClass("just-copied");
      copyButton.setAttribute("disabled", "true");
      setTimeout(() => {
        copyButton.innerHTML = copyButtonSVGText;
        copyButton.removeClass("just-copied");
        copyButton.removeAttribute("disabled");
      }, 3000);
    })
    .catch((error: unknown) => {
      console.error(error);
    });
}

const copyButtonSVGText = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-copy">
<rect x="8" y="8" width="14" height="14" rx="2" ry="2"></rect>
<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>`;
