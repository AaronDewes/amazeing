import styles from "./CodeEditor.module.css";
import clsx from "clsx";
import { CornerGroup } from "../../../../shared/components/CornerGroup/CornerGroup.tsx";
import ReactCodeMirror, { Prec, tooltips } from "@uiw/react-codemirror";
import { amazeing } from "../../../../core/amazeing/amazeing.ts";
import { EditorView, keymap } from "@codemirror/view";
import { acceptCompletion } from "@codemirror/autocomplete";
import { amazeingAutocomplete } from "../../../../core/amazeing/autocomplete/autocomplete.ts";
import { useCodeEditorSettings } from "../../context/settings/CodeEditorSettingsContext.tsx";
import { useEditorTheme } from "../../../../shared/theme/EditorThemeContext.tsx";
import type { Extension } from "@codemirror/state";
import { TopBar, type TopBarProps } from "./TopBar/TopBar.tsx";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";
import type { VariableMap } from "../../../../core/interpreter/environment.ts";
import { setCurrentLineEffect } from "../../../../core/amazeing/currentLineHighlighter.ts";
import { setVariablesEffect } from "../../../../core/amazeing/variableHover.ts";

export type CodeEditorProps = {
  title?: string;
  code: string;
  setCode: (code: string) => void;
  editorExtensions?: Extension[];
  topBar?: TopBarProps;
  transitionDuration?: number;
  settingsButton?: boolean;
  showTopBar?: boolean;
  autocomplete?: boolean;
  currentLine?: number | null;
  variables?: VariableMap;
};

export function CodeEditor({
  title,
  code,
  setCode,
  editorExtensions,
  topBar = {},
  transitionDuration = 0,
  settingsButton = true,
  showTopBar = true,
  autocomplete = true,
  currentLine,
  variables,
}: CodeEditorProps) {
  const { theme } = useEditorTheme();
  const { settings } = useCodeEditorSettings();
  const viewRef = useRef<EditorView | null>(null);

  const tooltipExtension = useMemo(
    () =>
      tooltips({
        position: "fixed",
        parent: document.getElementById("tooltip-root")!,
      }),
    [],
  );

  const topPaddingExtension = useMemo(
    () =>
      EditorView.theme({
        ".cm-scroller": {
          paddingTop: showTopBar ? "3rem" : null,
        },
      }),
    [showTopBar],
  );

  const tabCompletionExtension = useMemo(
    () => Prec.highest(keymap.of([{ key: "Tab", run: acceptCompletion }])),
    [],
  );

  const extensions = useMemo(
    () => [
      amazeing,
      autocomplete ? amazeingAutocomplete : [],
      tooltipExtension,
      ...(editorExtensions ?? []),
      topPaddingExtension,
      EditorView.lineWrapping,
      tabCompletionExtension,
    ],
    [
      autocomplete,
      editorExtensions,
      tabCompletionExtension,
      tooltipExtension,
      topPaddingExtension,
    ],
  );

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: setCurrentLineEffect.of(currentLine ?? null) });
  }, [currentLine]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || variables === undefined) return;
    view.dispatch({ effects: setVariablesEffect.of(variables) });
  }, [variables]);

  return (
    <div
      className={clsx(
        styles.container,
        theme.isLight ? "light-theme" : "dark-theme",
      )}
      style={
        {
          "--exec-line-transition-duration": `${transitionDuration}s`,
        } as CSSProperties
      }
    >
      {showTopBar && (
        <CornerGroup position="top-right" className={styles.cornerGroup}>
          <TopBar title={title} settingsButton={settingsButton} {...topBar} />
        </CornerGroup>
      )}

      <ReactCodeMirror
        value={code}
        className={styles.codeEditor}
        height="100%"
        theme={theme.extension}
        extensions={extensions}
        onCreateEditor={(view) => {
          viewRef.current = view;
          view.dispatch({ effects: setCurrentLineEffect.of(currentLine ?? null) });
          if (variables !== undefined) {
            view.dispatch({ effects: setVariablesEffect.of(variables) });
          }
        }}
        onChange={(value) => setCode(value)}
        basicSetup={{
          lineNumbers: false,
          searchKeymap: false,
        }}
        style={{
          fontSize: settings.fontSize,
          fontFamily: "JetBrains Mono, monospace",
        }}
      />
    </div>
  );
}
