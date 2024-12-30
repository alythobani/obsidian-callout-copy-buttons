import { WidgetType } from "@codemirror/view";
import { copyButtonSVGText } from "./copyButton";

export class CopyButtonWidget extends WidgetType {
  constructor(private text: string) {
    super();
  }

  toDOM(): HTMLElement {
    const copyButton = document.createElement("div");
    copyButton.addClasses(["callout-copy-button-widget"]);
    copyButton.setAttribute("aria-label", "Copy");

    copyButton.innerHTML = copyButtonSVGText;

    copyButton.addEventListener("click", (e) => {
      e.stopPropagation();
      navigator.clipboard
        .writeText(this.text)
        .then(() => {
          console.log(`Copied: ${JSON.stringify(this.text)}`);
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
    });

    return copyButton;
  }

  ignoreEvent(): boolean {
    // Prevent clicks from being interpreted as editor interactions
    return true;
  }
}
