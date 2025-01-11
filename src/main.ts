import { Plugin } from "obsidian";
import { watchAndAddCopyButtonsToDOM } from "./DOMObserver";
import { postProcessMarkdown } from "./markdownPostProcessor";
import { removeCopyButtonsAndRestoreEditBlockButton } from "./utils/cleanupDOM";
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
  }

  onunload(): void {
    this.logInfo("Unloading Callout Copy Button plugin");
    removeCopyButtonsAndRestoreEditBlockButton();
    this.disconnectCalloutDivObserver();
  }

  private disconnectCalloutDivObserver(): void {
    if (this.calloutDivObserver === null) {
      return;
    }
    this.calloutDivObserver.disconnect();
    this.calloutDivObserver = null;
  }
}
