import { type MarkdownPostProcessorContext } from "obsidian";
import { type PluginSettingsManager } from "./settings";
import {
  addCopyButtonToCallout,
  addCopyPlainTextButtonToCalloutDiv,
} from "./utils/addCopyButtonToCallout";
import { getCalloutBodyTextFromSectionInfo } from "./utils/getCalloutBodyText";

export function getMarkdownPostProcessor({
  pluginSettingsManager,
}: {
  pluginSettingsManager: PluginSettingsManager;
}): (el: HTMLElement, ctx: MarkdownPostProcessorContext) => void {
  return (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    postProcessMarkdown(el, ctx, pluginSettingsManager);
  };
}

function postProcessMarkdown(
  el: HTMLElement,
  ctx: MarkdownPostProcessorContext,
  pluginSettingsManager: PluginSettingsManager
): void {
  const { topLevelCallout, isCMCalloutNode } = getTopLevelCalloutNode(el);
  if (topLevelCallout === null) {
    // Callout node not found within the rendered markdown section
    return;
  }
  maybeAddCopyMarkdownFromSectionInfoButtonToCallout({
    calloutNode: topLevelCallout,
    ctx,
    isCMCalloutNode,
    pluginSettingsManager,
  });
  const { showCopyPlainTextButton: showCopyPlainTextButton } =
    pluginSettingsManager.getSetting("readingModeSettings");
  const isReadingMode = !isCMCalloutNode; // .cm-callout nodes are only present in Live Preview mode
  if (isReadingMode && !showCopyPlainTextButton) {
    // User has disabled Copy Plain Text buttons in Reading Mode; return early without adding them
    return;
  }
  addCopyPlainTextButtonToCalloutDiv({
    calloutNode: topLevelCallout,
    isCMCalloutNode,
    pluginSettingsManager,
  });
  const nestedCallouts = topLevelCallout.findAll(".callout");
  nestedCallouts.forEach((nestedCallout) => {
    addCopyPlainTextButtonToCalloutDiv({
      calloutNode: nestedCallout,
      isCMCalloutNode: false,
      pluginSettingsManager,
    });
  });
}

function getTopLevelCalloutNode(el: HTMLElement): {
  topLevelCallout: HTMLElement | null;
  isCMCalloutNode: boolean;
} {
  const maybeCMCalloutNode = el.closest<HTMLElement>(".cm-callout");
  if (maybeCMCalloutNode !== null) {
    return { topLevelCallout: maybeCMCalloutNode, isCMCalloutNode: true };
  }
  const maybeTopLevelCallout = el.querySelector<HTMLElement>(".callout");
  if (maybeTopLevelCallout === null) {
    return { topLevelCallout: null, isCMCalloutNode: false };
  }
  return { topLevelCallout: maybeTopLevelCallout, isCMCalloutNode: false };
}

function maybeAddCopyMarkdownFromSectionInfoButtonToCallout({
  calloutNode,
  ctx,
  isCMCalloutNode,
  pluginSettingsManager,
}: {
  calloutNode: HTMLElement;
  ctx: MarkdownPostProcessorContext;
  isCMCalloutNode: boolean;
  pluginSettingsManager: PluginSettingsManager;
}): void {
  if (isCMCalloutNode) {
    // Section info not available in Live Preview mode; not adding copy markdown button
    return;
  }
  if (calloutNode.querySelector(".callout-copy-button-markdown")) {
    // Copy Markdown button already exists; not adding another one
    return;
  }
  addCopyButtonToCallout({
    calloutNode,
    getCalloutBodyText: () => {
      const calloutSectionInfo = ctx.getSectionInfo(calloutNode);
      if (calloutSectionInfo === null) {
        // Section info not available for some reason
        return null;
      }
      const calloutBodyText = getCalloutBodyTextFromSectionInfo(calloutSectionInfo);
      if (calloutBodyText === null) {
        return null;
      }
      return calloutBodyText;
    },
    tooltipText: "Copy (Markdown)",
    buttonClassName: "callout-copy-button-markdown",
    isCMCalloutNode,
    pluginSettingsManager,
  });
}
