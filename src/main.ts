import { Plugin } from "obsidian";
import { postProcessMarkdown } from "./markdownPostProcessor";
import { addCopyButtonToCallout } from "./utils/addCopyButtonToCallout";
import { getCalloutBodyTextFromInnerText } from "./utils/getCalloutBodyText";
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

    // The Markdown post processor is able to access the original markdown text easier than the
    // mutation observer
    this.registerMarkdownPostProcessor(postProcessMarkdown);
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
          [...newCMCalloutNodes, ...newCalloutNodes].forEach((calloutNode) =>
            addCopyButtonToCallout({
              calloutNode,
              getCalloutBodyText: () => getCalloutBodyTextFromInnerText(calloutNode),
              tooltipText: "Copy (plain text)",
            })
          );
        });
      });
    });
  }

  private addAllCopyButtons(): void {
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
