import { type MarkdownPostProcessorContext } from "obsidian";
import { addCopyButtonToCallout } from "./utils/addCopyButtonToCallout";
import { getCalloutBodyTextFromSectionInfo } from "./utils/getCalloutBodyText";

export function postProcessMarkdown(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
  console.log("Post-processing markdown", el);
  const calloutNodes = el.findAll(".callout");
  calloutNodes.forEach((calloutNode) => {
    console.log("Processing callout node", calloutNode);
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
    });
  });
}
