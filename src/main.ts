import { Plugin } from "obsidian";
import { watchAndAddCopyButtonsToDOM } from "./DOMObserver";
import { getMarkdownPostProcessor } from "./markdownPostProcessor";
import { PluginSettingsManager } from "./settings";
import { removeCopyButtonsAndRestoreEditBlockButton } from "./utils/cleanupDOM";
import { createCalloutCopyButtonViewPlugin } from "./viewPlugin/viewPlugin";

export default class CalloutCopyButtonPlugin extends Plugin {
  private calloutDivObserver: MutationObserver | null = null;
  private pluginSettingsManager = new PluginSettingsManager(this);

  private logInfo(message: string): void {
    console.log(`${this.manifest.name}: ${message}`);
  }

  async onload(): Promise<void> {
    this.logInfo("Loading Callout Copy Button plugin");

    const { pluginSettingsManager } = this;

    await pluginSettingsManager.setupSettingsTab();

    this.app.workspace.onLayoutReady(() => {
      const calloutCopyButtonViewPlugin = createCalloutCopyButtonViewPlugin(pluginSettingsManager);
      this.registerEditorExtension([calloutCopyButtonViewPlugin]);
      this.registerMarkdownPostProcessor(getMarkdownPostProcessor({ pluginSettingsManager }));
      this.calloutDivObserver = watchAndAddCopyButtonsToDOM({ pluginSettingsManager });
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
