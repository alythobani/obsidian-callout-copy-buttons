import { type MarkdownPostProcessorContext } from "obsidian";
import {
  addCopyButtonToCallout,
  addCopyPlainTextButtonToCalloutDiv,
} from "./utils/addCopyButtonToCallout";
import { getCalloutBodyTextFromSectionInfo } from "./utils/getCalloutBodyText";

export function postProcessMarkdown(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
  console.log("Post-processing markdown", el);
  const { topLevelCallout, isCMCalloutNode } = getTopLevelCalloutNode(el);
  if (topLevelCallout === null) {
    console.warn("No top-level callout node found", el);
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
    console.group("ADDING PLAIN TEXT BUTTON TO NESTED CALLOUT", nestedCallout);
    addCopyPlainTextButtonToCalloutDiv({ calloutNode: topLevelCallout, isCMCalloutNode: false });
    console.groupEnd();
  });
}

function getTopLevelCalloutNode(el: HTMLElement): {
  topLevelCallout: HTMLElement | null;
  isCMCalloutNode: boolean;
} {
  const maybeCMCalloutNode = el.closest<HTMLElement>(".cm-callout");
  if (maybeCMCalloutNode !== null) {
    console.log("FOUND CM CALLOUT NODE", maybeCMCalloutNode);
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
    console.warn(
      "Section info not available in Live Preview mode; not adding copy markdown button"
    );
    return;
  }
  console.log("Adding copy markdown button to callout", calloutNode);
  if (calloutNode.querySelector(".callout-copy-button-markdown")) {
    console.warn("Copy Markdown button already exists; not adding another one", calloutNode);
    return;
  }
  addCopyButtonToCallout({
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
    tooltipText: "Copy (Markdown)",
    buttonClassName: "callout-copy-button-markdown",
    isCMCalloutNode,
  });
}
