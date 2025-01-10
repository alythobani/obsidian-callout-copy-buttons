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
  className,
}: {
  getCalloutBodyText: () => string;
  className?: string;
}): HTMLDivElement {
  const copyButton = document.createElement("div");
  copyButton.addClass("callout-copy-button");
  if (className !== undefined) copyButton.addClass(className);
  copyButton.setAttribute("aria-label", "Copy");
  copyButton.innerHTML = copyButtonSVGText;
  copyButton.addEventListener("click", (e) => {
    if (copyButton.hasAttribute("disabled")) return;
    onCopyButtonClick({ e, getCalloutBodyText, copyButton });
  });
  return copyButton;
}

function onCopyButtonClick({
  e,
  getCalloutBodyText,
  copyButton,
}: {
  e: MouseEvent;
  getCalloutBodyText: () => string;
  copyButton: HTMLDivElement;
}): void {
  e.stopPropagation();
  if (copyButton.hasAttribute("disabled")) return;
  const calloutBodyText = getCalloutBodyText();
  navigator.clipboard
    .writeText(calloutBodyText)
    .then(() => {
      console.log(`Copied: ${JSON.stringify(calloutBodyText)}`);
      copyButton.innerHTML = copyButtonCheckmarkIconSVGText;
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
