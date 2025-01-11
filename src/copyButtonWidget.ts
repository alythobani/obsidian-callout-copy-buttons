import { WidgetType } from "@codemirror/view";
import { copyButtonCheckmarkIconSVGText, copyButtonSVGText } from "./copyButton";

export class CopyButtonWidget extends WidgetType {
  constructor(private text: string) {
    super();
  }

  toDOM(): HTMLElement {
    const copyButton = document.createElement("div");
    copyButton.addClasses([
      "callout-copy-button",
      "callout-copy-button-widget",
      "callout-copy-button-markdown",
    ]);
    copyButton.setAttribute("aria-label", "Copy (Markdown)");

    copyButton.innerHTML = copyButtonSVGText;

    copyButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (copyButton.hasAttribute("disabled")) return;
      navigator.clipboard
        .writeText(this.text)
        .then(() => {
          console.log(`Copied: ${JSON.stringify(this.text)}`);
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
    });

    return copyButton;
  }

  ignoreEvent(): boolean {
    // Prevent clicks from being interpreted as editor interactions
    return true;
  }
}
