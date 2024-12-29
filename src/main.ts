import { Plugin } from "obsidian";

export default class CalloutCopyButtonPlugin extends Plugin {
  private logInfo(message: string): void {
    console.log(`${this.manifest.name}: ${message}`);
  }

  onload(): void {
    this.logInfo("Loading Callout Copy Button plugin");
    // this.registerEditorExtension(calloutCopyButtonViewPlugin);
    //  registerCalloutCopyButtonDomExtension(this.app, this);
    // Add the copy button when the plugin is loaded
    this.registerCalloutCopyButtonObserver();
  }

  private registerCalloutCopyButtonObserver(): void {
    // Listen for DOM mutations to dynamically add buttons to callouts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.matches(".callout")) {
            this.addButtonToCallout(node);
          }
        });
      });
    });

    // Start observing the document body
    observer.observe(document.body, { childList: true, subtree: true });

    // Add buttons to existing callouts
    document.querySelectorAll(".callout").forEach((callout) => {
      if (callout instanceof HTMLElement) {
        this.addButtonToCallout(callout);
      }
    });
  }

  private addButtonToCallout(calloutNode: HTMLElement): void {
    if (calloutNode.querySelector(".copy-button")) return;

    const copyButton = createCopyButton(calloutNode);

    // Append the button to the callout
    const calloutTitleChild = calloutNode.querySelector(".callout-title");
    calloutTitleChild?.appendChild(copyButton);
  }

  onunload(): void {
    this.logInfo("Unloading Callout Copy Button plugin");
    this.removeCalloutCopyButtons();
  }

  private removeCalloutCopyButtons(): void {
    document.querySelectorAll(".copy-button").forEach((button) => {
      button.remove();
    });
  }
}

function createCopyButton(calloutNode: HTMLElement): HTMLButtonElement {
  const copyButton = document.createElement("button");
  copyButton.textContent = "Copy";
  copyButton.classList.add("copy-button");
  copyButton.setAttribute("title", "Copy to clipboard");
  copyButton.setAttribute("aria-label", "Copy to clipboard");
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
  copyButton: HTMLButtonElement;
}): void {
  const content = calloutNode.querySelector(".callout-content");
  if (content) {
    navigator.clipboard
      .writeText(content.textContent ?? "")
      .then(() => {
        copyButton.textContent = "Copied!";
        setTimeout(() => (copyButton.textContent = "Copy"), 2000);
      })
      .catch((error: unknown) => {
        console.error(error);
      });
  }
  e.stopPropagation();
}
