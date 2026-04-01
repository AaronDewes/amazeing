import {
  Decoration,
  type DecorationSet,
  EditorView,
} from "@codemirror/view";
import {
  type Extension,
  RangeSetBuilder,
  StateEffect,
  StateField,
  type Text,
} from "@codemirror/state";

const CLASS_ACTIVE_NAME = "cm-execLine";

export const setCurrentLineEffect = StateEffect.define<number | null>();

export const currentLineField = StateField.define<number | null>({
  create: () => null,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setCurrentLineEffect)) {
        return effect.value;
      }
    }
    return value;
  },
});

function buildDecorations(lineNumber: number | null, doc: Text): DecorationSet {
  if (lineNumber == null || lineNumber < 1 || lineNumber > doc.lines) {
    return Decoration.none;
  }

  const line = doc.line(lineNumber);
  const builder = new RangeSetBuilder<Decoration>();
  builder.add(
    line.from,
    line.from,
    Decoration.line({ class: CLASS_ACTIVE_NAME }),
  );
  return builder.finish();
}

const currentLineDecorationsField = StateField.define<DecorationSet>({
  create(state) {
    return buildDecorations(state.field(currentLineField), state.doc);
  },
  update(decorations, tr) {
    const changedLine = tr.effects.some((effect) => effect.is(setCurrentLineEffect));
    if (!tr.docChanged && !changedLine) {
      return decorations;
    }
    return buildDecorations(tr.state.field(currentLineField), tr.state.doc);
  },
  provide: (field) => EditorView.decorations.from(field),
});

export const currentLineHighlighter: Extension = [
  currentLineField,
  currentLineDecorationsField,
];
