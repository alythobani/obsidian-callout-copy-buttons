import classNames from "classnames";
import { Notice, setIcon } from "obsidian";
import { addClassNames } from "./utils/addClassNames";

export function createCopyButton({
  getCalloutBodyText,
  tooltipText,
  className,
}: {
  getCalloutBodyText: () => string | null;
  tooltipText: string;
  className?: string;
}): HTMLDivElement {
  const copyButton = document.createElement("div");

  addClassNames({ el: copyButton, classNames: classNames("callout-copy-button", className) });
  copyButton.setAttribute("aria-label", tooltipText);
  setIcon(copyButton, "copy");

  // Using `mousedown` lets us prevent the default behavior of the `click` event (e.g. taking focus
  // which changes cursor/selection position in the editor)
  copyButton.addEventListener("mousedown", (e) => {
    e.preventDefault();
    if (copyButton.hasAttribute("disabled")) return;
    void onCopyButtonClick({ getCalloutBodyText, copyButton });
  });

  // For some reason still need this to prevent the default behavior of clicking the callout block
  // (i.e. moving the cursor into the block to edit the callout)
  copyButton.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  return copyButton;
}

async function onCopyButtonClick({
  getCalloutBodyText,
  copyButton,
}: {
  getCalloutBodyText: () => string | null;
  copyButton: HTMLDivElement;
}): Promise<void> {
  if (copyButton.hasAttribute("disabled")) return;
  const calloutBodyText = getCalloutBodyText();

  if (calloutBodyText === null) {
    new Notice("Error: Could not copy callout text");
    return;
  }

  await navigator.clipboard.writeText(calloutBodyText);

  // console.log(`Copied: ${JSON.stringify(calloutBodyText)}`);
  setIcon(copyButton, "check");
  copyButton.classList.add("just-copied");
  copyButton.setAttribute("disabled", "true");

  setTimeout(() => {
    setIcon(copyButton, "copy");
    copyButton.classList.remove("just-copied");
    copyButton.removeAttribute("disabled");
  }, 3000);
}
