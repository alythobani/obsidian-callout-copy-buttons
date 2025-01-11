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
import { getCalloutBodyLines } from "../utils/getCalloutBodyText";
import { CopyButtonWidget } from "./copyButtonWidget";

const CALLOUT_HEADER_WITH_INDENT_CAPTURE_REGEX = /^((?:> )+)\[!.+\]/;

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

    for (let line = 1; line <= doc.lines; line++) {
      const lineText = doc.line(line).text;
      const calloutIndent = CALLOUT_HEADER_WITH_INDENT_CAPTURE_REGEX.exec(lineText)?.[1];
      if (calloutIndent === undefined) {
        // Not the start of a callout block
        continue;
      }
      const calloutBodyLines = getCalloutBodyLines({ doc, calloutIndent, bodyStartLine: line + 1 });
      const calloutBodyText = calloutBodyLines.join("\n");
      const deco = Decoration.widget({
        widget: new CopyButtonWidget(calloutBodyText),
        side: 1, // Place the widget on the right
      });
      const from = doc.line(line).from;
      builder.add(from, from, deco);
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
