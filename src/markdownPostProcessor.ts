import { type MarkdownPostProcessorContext } from "obsidian";
import {
  addCopyButtonToCallout,
  addCopyPlainTextButtonToCallout,
} from "./utils/addCopyButtonToCallout";
import { getCalloutBodyTextFromSectionInfo } from "./utils/getCalloutBodyText";

export function postProcessMarkdown(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
  console.log("Post-processing markdown", el);
  const topLevelCallout = el.querySelector<HTMLElement>(".callout");
  if (topLevelCallout === null) {
    return;
  }
  addCopyMarkdownFromSectionInfoButtonToCallout({ calloutNode: topLevelCallout, ctx });
  addCopyPlainTextButtonToCallout({ calloutNode: topLevelCallout });
  const nestedCallouts = topLevelCallout.findAll(".callout");
  nestedCallouts.forEach((nestedCallout) => {
    console.group("ADDING PLAIN TEXT BUTTON TO NESTED CALLOUT", nestedCallout);
    addCopyPlainTextButtonToCallout({ calloutNode: nestedCallout });
    console.groupEnd();
  });
}

function addCopyMarkdownFromSectionInfoButtonToCallout({
  calloutNode,
  ctx,
}: {
  calloutNode: HTMLElement;
  ctx: MarkdownPostProcessorContext;
}): void {
  console.log("Adding copy markdown button to callout", calloutNode);
  if (calloutNode.querySelector(".callout-copy-button-markdown")) {
    console.warn("Copy button already exists; not adding another one", calloutNode);
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
  });
}
