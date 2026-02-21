import { ParsedTable } from "./tableParser";

/** デコレーション割り当て */
export interface DecorationAssignment {
  line: number;
  startChar: number;
  endChar: number;
  colorIndex: number;
}

/** カーソル位置 (VSCode型不使用) */
export interface CursorPosition {
  line: number;
  character: number;
}

/** ハイライトオプション */
export interface HighlightOptions {
  colorCount: number;
  cursorColorEnabled: boolean;
  singleTable: boolean;
}

/** ハイライト計算結果 */
export interface HighlightResult {
  columnDecorations: DecorationAssignment[];
  cursorDecorations: DecorationAssignment[];
}

function findCursorColumnIndex(
  table: ParsedTable,
  cursor: CursorPosition,
): number | null {
  if (cursor.line < table.startLine || cursor.line > table.endLine) {
    return null;
  }
  const spans = table.columns.get(cursor.line);
  if (!spans) {
    return null;
  }
  for (const span of spans) {
    if (cursor.character >= span.startChar && cursor.character <= span.endChar) {
      return span.columnIndex;
    }
  }
  return null;
}

/**
 * 全テーブルのデコレーション割り当てを計算する。
 */
export function calculateHighlights(
  tables: ParsedTable[],
  cursor: CursorPosition | null,
  options: HighlightOptions,
): HighlightResult {
  const columnDecorations: DecorationAssignment[] = [];
  const cursorDecorations: DecorationAssignment[] = [];

  // Filter tables for singleTableMode
  let targetTables = tables;
  if (options.singleTable && cursor !== null) {
    targetTables = tables.filter(
      (t) => cursor.line >= t.startLine && cursor.line <= t.endLine,
    );
  }

  for (const table of targetTables) {
    for (const [line, spans] of table.columns) {
      for (const span of spans) {
        columnDecorations.push({
          line,
          startChar: span.startChar,
          endChar: span.endChar,
          colorIndex: span.columnIndex % options.colorCount,
        });
      }
    }

    // Cursor column highlighting
    if (options.cursorColorEnabled && cursor !== null) {
      const cursorColumnIndex = findCursorColumnIndex(table, cursor);
      if (cursorColumnIndex !== null) {
        for (const [line, spans] of table.columns) {
          for (const span of spans) {
            if (span.columnIndex === cursorColumnIndex) {
              cursorDecorations.push({
                line,
                startChar: span.startChar,
                endChar: span.endChar,
                colorIndex: span.columnIndex % options.colorCount,
              });
            }
          }
        }
      }
    }
  }

  return { columnDecorations, cursorDecorations };
}
