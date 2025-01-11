import { Plugin } from "obsidian";
import { watchAndAddCopyButtonsToDOM } from "./DOMObserver";
import { postProcessMarkdown } from "./markdownPostProcessor";
import { calloutCopyButtonViewPlugin } from "./viewPlugin";

export default class CalloutCopyButtonPlugin extends Plugin {
  calloutDivObserver: MutationObserver | null = null;

  private logInfo(message: string): void {
    console.log(`${this.manifest.name}: ${message}`);
  }

  onload(): void {
    this.logInfo("Loading Callout Copy Button plugin");

    this.app.workspace.onLayoutReady(() => {
      this.registerEditorExtension([calloutCopyButtonViewPlugin]);
      this.registerMarkdownPostProcessor(postProcessMarkdown);
      this.calloutDivObserver = watchAndAddCopyButtonsToDOM();
    });

    // The Markdown post processor is able to access the original markdown text easier than the
    // mutation observer
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
    if (this.calloutDivObserver === null) {
      return;
    }
    this.calloutDivObserver.disconnect();
    this.calloutDivObserver = null;
  }
}

function getCodeMirrorCalloutParent(node: Element): Element | null {
  return node.closest(".cm-callout");
}
