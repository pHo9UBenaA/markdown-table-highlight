import * as vscode from "vscode";
import { HighlightResult } from "./decorationRanges";

export class DecorationManager {
  private colorDecorationTypes: vscode.TextEditorDecorationType[];
  private cursorDecorationType: vscode.TextEditorDecorationType | null;

  constructor(colors: string[], cursorColor: string | null) {
    this.colorDecorationTypes = colors.map((color) =>
      vscode.window.createTextEditorDecorationType({
        backgroundColor: color,
        isWholeLine: false,
      }),
    );
    this.cursorDecorationType = cursorColor
      ? vscode.window.createTextEditorDecorationType({
          backgroundColor: cursorColor,
          isWholeLine: false,
        })
      : null;
  }

  applyDecorations(editor: vscode.TextEditor, result: HighlightResult): void {
    // Group columnDecorations by colorIndex
    const rangesByColor: vscode.Range[][] = this.colorDecorationTypes.map(
      () => [],
    );

    for (const dec of result.columnDecorations) {
      if (dec.colorIndex < rangesByColor.length) {
        rangesByColor[dec.colorIndex].push(
          new vscode.Range(dec.line, dec.startChar, dec.line, dec.endChar + 1),
        );
      }
    }

    // Apply each color's ranges (unused colors get empty array = cleared)
    for (let i = 0; i < this.colorDecorationTypes.length; i++) {
      editor.setDecorations(this.colorDecorationTypes[i], rangesByColor[i]);
    }

    // Apply cursor decorations
    if (this.cursorDecorationType) {
      const cursorRanges = result.cursorDecorations.map(
        (dec) =>
          new vscode.Range(dec.line, dec.startChar, dec.line, dec.endChar + 1),
      );
      editor.setDecorations(this.cursorDecorationType, cursorRanges);
    }
  }

  clearDecorations(editor: vscode.TextEditor): void {
    for (const decorationType of this.colorDecorationTypes) {
      editor.setDecorations(decorationType, []);
    }
    if (this.cursorDecorationType) {
      editor.setDecorations(this.cursorDecorationType, []);
    }
  }

  dispose(): void {
    for (const decorationType of this.colorDecorationTypes) {
      decorationType.dispose();
    }
    if (this.cursorDecorationType) {
      this.cursorDecorationType.dispose();
    }
    this.colorDecorationTypes = [];
    this.cursorDecorationType = null;
  }

  recreate(colors: string[], cursorColor: string | null): void {
    this.dispose();
    this.colorDecorationTypes = colors.map((color) =>
      vscode.window.createTextEditorDecorationType({
        backgroundColor: color,
        isWholeLine: false,
      }),
    );
    this.cursorDecorationType = cursorColor
      ? vscode.window.createTextEditorDecorationType({
          backgroundColor: cursorColor,
          isWholeLine: false,
        })
      : null;
  }
}
