import { type MarkdownPostProcessorContext } from "obsidian";
import {
  addCopyButtonToCallout,
  addCopyPlainTextButtonToCalloutDiv,
} from "./utils/addCopyButtonToCallout";
import { getCalloutBodyTextFromSectionInfo } from "./utils/getCalloutBodyText";

export function postProcessMarkdown(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
  const { topLevelCallout, isCMCalloutNode } = getTopLevelCalloutNode(el);
  if (topLevelCallout === null) {
    // Callout node not found within the rendered markdown section
    return;
  }
  maybeAddCopyMarkdownFromSectionInfoButtonToCallout({
    calloutNode: topLevelCallout,
    ctx,
    isCMCalloutNode,
  });
  addCopyPlainTextButtonToCalloutDiv({ calloutNode: topLevelCallout, isCMCalloutNode });
  const nestedCallouts = topLevelCallout.findAll(".callout");
  nestedCallouts.forEach((nestedCallout) => {
    addCopyPlainTextButtonToCalloutDiv({ calloutNode: nestedCallout, isCMCalloutNode: false });
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
}: {
  calloutNode: HTMLElement;
  ctx: MarkdownPostProcessorContext;
  isCMCalloutNode: boolean;
}): void {
  if (isCMCalloutNode) {
    // Section info not available in CodeMirror callouts; not adding copy markdown button
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
  });
}
