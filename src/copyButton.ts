export const copyButtonSVGText = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-copy">
<rect x="8" y="8" width="14" height="14" rx="2" ry="2"></rect>
<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
</svg>`;

export function createCopyButton({
  calloutNode,
  classNames = [],
}: {
  calloutNode: HTMLElement;
  classNames?: string[];
}): HTMLDivElement {
  const copyButton = document.createElement("div");
  copyButton.addClasses(["callout-copy-button", ...classNames]);
  copyButton.setAttribute("aria-label", "Copy");

  copyButton.innerHTML = copyButtonSVGText;

  copyButton.addEventListener("click", (e) => onCopyButtonClick({ e, calloutNode, copyButton }));
  return copyButton;
}

function onCopyButtonClick({
  e,
  calloutNode,
  copyButton,
}: {
  e: MouseEvent;
  calloutNode: HTMLElement;
  copyButton: HTMLDivElement;
}): void {
  e.stopPropagation();
  const contentDiv = calloutNode.querySelector(".callout-content");
  if (contentDiv === null) {
    console.error("Callout content div not found; cannot copy", calloutNode);
    return;
  }
  const trimmedContent = contentDiv.textContent?.trim();
  navigator.clipboard
    .writeText(trimmedContent ?? "")
    .then(() => {
      console.log(`Copied: ${JSON.stringify(trimmedContent)}`);
      copyButton.innerHTML = "✔"; // Temporary feedback
      copyButton.addClass("just-copied");
      copyButton.setAttribute("disabled", "true");
      setTimeout(() => {
        copyButton.innerHTML = copyButtonSVGText;
        copyButton.removeClass("just-copied");
        copyButton.removeAttribute("disabled");
      }, 3000);
    })
    .catch((error: unknown) => {
      console.error(error);
    });
}
