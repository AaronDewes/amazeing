import type { VariableMap } from "../interpreter/environment.ts";
import {
  Decoration,
  type EditorView,
  hoverTooltip,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder, StateEffect, StateField } from "@codemirror/state";
import { formatValue } from "../interpreter/executor.ts";

export const setVariablesEffect = StateEffect.define<VariableMap>();

export const variablesField = StateField.define<VariableMap>({
  create: () => new Map(),
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setVariablesEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

export const variableHover = hoverTooltip((view, pos) => {
  const node = syntaxTree(view.state).resolveInner(pos);
  if (!isVariableType(node.type.name)) return null;

  const word = view.state.wordAt(pos);
  if (!word) return null;

  const name = view.state.doc.sliceString(word.from, word.to);
  const value = view.state.field(variablesField).get(name);
  if (value === undefined) return null;

  return {
    pos: word.from,
    end: word.to,
    arrow: true,
    create() {
      const root = document.createElement("div");
      root.className = "cm-variable-hover fancy-headers";

      const header = document.createElement("h6");
      header.className = "header";
      header.innerText = name;

      const content = document.createElement("div");
      content.className = "content";
      content.innerText = formatValue(value);

      root.appendChild(header);
      root.appendChild(content);

      return { dom: root };
    },
  };
});

function isVariableType(name: string) {
  // Document is used for words without type
  return name.toLowerCase().startsWith("variable") || name === "Document" || name === "content";
}

const variableDecoration = Decoration.mark({
  class: "cm-variable-has-value",
});

export const variableHighlight = ViewPlugin.fromClass(
  class {
    decorations;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      const variableChange = update.transactions.some((transaction) =>
        transaction.effects.some((effect) => effect.is(setVariablesEffect)),
      );
      if (update.docChanged || update.viewportChanged || variableChange) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView) {
      const variables = view.state.field(variablesField);
      const builder = new RangeSetBuilder<Decoration>();

      for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
          from,
          to,
          enter: (node) => {
            if (!isVariableType(node.type.name)) return;

            const name = view.state.doc.sliceString(node.from, node.to);
            if (!variables.has(name)) return;

            builder.add(node.from, node.to, variableDecoration);
          },
        });
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);
