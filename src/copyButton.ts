import classNames from "classnames";
import { addClassNames } from "./utils/addClassNames";

export const copyButtonSVGText = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-copy">
<rect x="8" y="8" width="14" height="14" rx="2" ry="2"></rect>
<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>`;

export const copyButtonCheckmarkIconSVGText = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-check">
<path d="M20 6 9 17l-5-5">
</path>
</svg>`;

export function createCopyButton({
  getCalloutBodyText,
  tooltipText,
  className,
}: {
  getCalloutBodyText: () => string;
  tooltipText: string;
  className?: string;
}): HTMLDivElement {
  const copyButton = document.createElement("div");

  addClassNames({ el: copyButton, classNames: classNames("callout-copy-button", className) });
  copyButton.setAttribute("aria-label", tooltipText);
  copyButton.innerHTML = copyButtonSVGText;

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
  getCalloutBodyText: () => string;
  copyButton: HTMLDivElement;
}): Promise<void> {
  if (copyButton.hasAttribute("disabled")) return;
  const calloutBodyText = getCalloutBodyText();

  await navigator.clipboard.writeText(calloutBodyText);

  console.log(`Copied: ${JSON.stringify(calloutBodyText)}`);
  copyButton.innerHTML = copyButtonCheckmarkIconSVGText;
  copyButton.classList.add("just-copied");
  copyButton.setAttribute("disabled", "true");

  setTimeout(() => {
    copyButton.innerHTML = copyButtonSVGText;
    copyButton.classList.remove("just-copied");
    copyButton.removeAttribute("disabled");
  }, 3000);
}
