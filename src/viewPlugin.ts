import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  type PluginSpec,
  type PluginValue,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";
import { CopyButtonWidget } from "./copyButtonWidget";

class CalloutCopyButtonViewPlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  destroy(): void {
    /* no-op */
  }

  buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;

    for (let line = 0; line < doc.lines; line++) {
      const text = doc.line(line + 1).text;

      if (text.startsWith("> [!")) {
        // Identify callout lines
        const from = doc.line(line + 1).from;
        // const to = doc.line(line + 1).to;

        // Create a decoration with metadata
        // console.log(`Adding copy button to line ${line + 1} from ${from} to ${to}`);
        const deco = Decoration.widget({
          widget: new CopyButtonWidget(text),
          side: 1, // Place the widget on the right
          attributes: {
            "data-callout-line": `${line + 1}`,
          },
        });
        // const deco = Decoration.mark({
        //   class: "cm-callout-decoration-mark",
        //   attributes: {
        //     "data-callout-line": `${line + 1}`,
        //   },
        // });
        // builder.add(from, to, deco);
        builder.add(from, from, deco);
      }
    }

    return builder.finish();
  }
}

const pluginSpec: PluginSpec<CalloutCopyButtonViewPlugin> = {
  decorations: (value: CalloutCopyButtonViewPlugin) => value.decorations,
};

export const calloutCopyButtonViewPlugin = [
  ViewPlugin.fromClass(CalloutCopyButtonViewPlugin, pluginSpec),
];
