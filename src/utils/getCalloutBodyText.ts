import { type Text } from "@codemirror/state";
import { type MarkdownSectionInformation } from "obsidian";

const CALLOUT_HEADER_WITH_INDENT_CAPTURE_REGEX = /^((?:> )+)\[!.+\]/;

/**
 * Gets the body content of the given callout node, in plain text format, from the `innerText` HTML
 * attribute of the node's `.callout-content` child div if found, else the callout node itself (in
 * which case we strip off the first line which corresponds to the callout header).
 *
 * Trims any leading/trailing whitespace before returning.
 */
export function getCalloutBodyPlainText(calloutNode: HTMLElement): string {
  const maybeBodyFromCalloutContentDiv =
    calloutNode.querySelector<HTMLDivElement>("div.callout-content")?.innerText;
  const calloutBodyContent =
    maybeBodyFromCalloutContentDiv ?? calloutNode.innerText.split("\n").slice(1).join("\n");
  return calloutBodyContent.replace(/\n\n\n+/g, "\n\n").trim();
}

/**
 * Returns the lines of the callout body, starting from the line after the callout header, with the
 * callout indent (matched from the callout header) stripped.
 */
export function getCalloutBodyLines({
  doc,
  calloutIndent,
  bodyStartLine,
}: {
  doc: Text;
  /** The indent of the callout (matched from the header), some positive multiple of "> " */
  calloutIndent: string;
  /** 1-indexed */
  bodyStartLine: number;
}): string[] {
  const calloutBodyLines = [];
  for (let i = bodyStartLine; i <= doc.lines; i++) {
    const maybeBodyLineWithIndent = doc.line(i).text;
    if (!maybeBodyLineWithIndent.startsWith(calloutIndent)) {
      return calloutBodyLines;
    }
    const calloutBodyLineText = maybeBodyLineWithIndent.slice(calloutIndent.length);
    calloutBodyLines.push(calloutBodyLineText);
  }
  return calloutBodyLines;
}

export function getCalloutBodyTextFromSectionInfo(
  calloutSectionInfo: MarkdownSectionInformation
): string | null {
  const calloutBodyLines = getCalloutBodyLinesFromSectionInfo(calloutSectionInfo);
  if (calloutBodyLines === null) {
    return null;
  }
  return calloutBodyLines.join("\n");
}

function getCalloutBodyLinesFromSectionInfo(
  calloutSectionInfo: MarkdownSectionInformation
): string[] | null {
  const { text, lineStart, lineEnd } = calloutSectionInfo;
  const allLines = text.split("\n");
  const headerLine = allLines[lineStart];
  if (headerLine === undefined) {
    // Line start is out of bounds
    return null;
  }
  const calloutIndent = CALLOUT_HEADER_WITH_INDENT_CAPTURE_REGEX.exec(headerLine)?.[1];
  if (calloutIndent === undefined) {
    // Line does not match callout header regex
    return null;
  }
  const calloutBodyLines = [];
  for (const maybeBodyLineWithIndent of allLines.slice(lineStart + 1, lineEnd + 1)) {
    if (!maybeBodyLineWithIndent.startsWith(calloutIndent)) {
      return calloutBodyLines;
    }
    const calloutBodyLineText = maybeBodyLineWithIndent.slice(calloutIndent.length);
    calloutBodyLines.push(calloutBodyLineText);
  }
  return calloutBodyLines;
}
