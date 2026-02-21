import * as vscode from "vscode";
import { parseTables } from "./tableParser";
import { calculateHighlights } from "./decorationRanges";
import { DecorationManager } from "./decorationManager";

const CONFIG_SECTION = "markdownTableHighlight";

const DEFAULT_COLORS = [
  "rgba(220,80,80,0.10)",
  "rgba(200,160,50,0.10)",
  "rgba(50,180,160,0.10)",
  "rgba(80,120,200,0.10)",
];

const DEFAULT_CURSOR_COLOR = "rgba(200,100,160,0.18)";

let decorationManager: DecorationManager | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
  const colors = config.get<string[]>("colors", [...DEFAULT_COLORS]);
  const cursorColor = config.get<string>("cursorColor", DEFAULT_CURSOR_COLOR);

  decorationManager = new DecorationManager(
    colors,
    cursorColor || null,
  );

  function updateDecorations(editor: vscode.TextEditor): void {
    const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const tables = parseTables(editor.document.getText());
    const cursor = {
      line: editor.selection.active.line,
      character: editor.selection.active.character,
    };
    const cfgCursorColor = cfg.get<string>("cursorColor", DEFAULT_CURSOR_COLOR);
    const result = calculateHighlights(tables, cursor, {
      colorCount: cfg.get<string[]>("colors", [...DEFAULT_COLORS]).length,
      cursorColorEnabled: cfgCursorColor !== "",
      singleTable: cfg.get<boolean>("singleTable", false),
    });
    decorationManager!.applyDecorations(editor, result);
  }

  function triggerUpdate(throttle: boolean): void {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    if (throttle) {
      const delay = config.get<number>("updateDelay", 100);
      timer = setTimeout(() => updateDecorations(editor), delay);
    } else {
      updateDecorations(editor);
    }
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => triggerUpdate(false)),
    vscode.window.onDidChangeTextEditorSelection(() => triggerUpdate(true)),
    vscode.workspace.onDidChangeTextDocument(() => triggerUpdate(true)),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_SECTION)) {
        const newConfig = vscode.workspace.getConfiguration(CONFIG_SECTION);
        const newColors = newConfig.get<string[]>("colors", [
          ...DEFAULT_COLORS,
        ]);
        const newCursorColor = newConfig.get<string>(
          "cursorColor",
          DEFAULT_CURSOR_COLOR,
        );
        decorationManager!.recreate(newColors, newCursorColor || null);
        triggerUpdate(false);
      }
    }),
  );

  if (vscode.window.activeTextEditor) {
    triggerUpdate(false);
  }
}

export function deactivate(): void {
  if (timer) {
    clearTimeout(timer);
  }
  decorationManager?.dispose();
}
