/** テーブル内の1つのカラムスパン */
export interface ColumnSpan {
  /** カラム内容の開始文字位置 (pipeの直後) */
  startChar: number;
  /** カラム内容の終了文字位置 (pipeの直前) */
  endChar: number;
  /** 0始まりのカラムインデックス */
  columnIndex: number;
}

/** パースされたテーブル */
export interface ParsedTable {
  /** 開始行番号 (0始まり、inclusive) */
  startLine: number;
  /** 終了行番号 (0始まり、inclusive) */
  endLine: number;
  /** 行番号 → その行のColumnSpan配列 のマップ */
  columns: Map<number, ColumnSpan[]>;
}

const TABLE_ROW_RE = /^([ \t]*>)*[ \t]*\|[^\r\n]*$/;

function parseColumns(line: string): ColumnSpan[] {
  const spans: ColumnSpan[] = [];
  const re = /\|((?:(?:\\.)|[^\\|])*?)(?=\|)/g;
  let match: RegExpExecArray | null;
  let columnIndex = 0;
  while ((match = re.exec(line)) !== null) {
    const startChar = match.index + 1; // skip the leading pipe
    const endChar = match.index + match[0].length - 1;
    spans.push({ startChar, endChar, columnIndex });
    columnIndex++;
  }
  return spans;
}

/**
 * テキスト内の全Markdownテーブルをパースする。
 * 連続するテーブル行のブロックごとに1つのParsedTableを返す。
 */
export function parseTables(text: string): ParsedTable[] {
  if (text === "") {
    return [];
  }

  const lines = text.split("\n");
  const tables: ParsedTable[] = [];
  let currentBlock: { startLine: number; lines: { lineIndex: number; text: string }[] } | null = null;

  for (let i = 0; i < lines.length; i++) {
    if (TABLE_ROW_RE.test(lines[i])) {
      if (currentBlock === null) {
        currentBlock = { startLine: i, lines: [] };
      }
      currentBlock.lines.push({ lineIndex: i, text: lines[i] });
    } else {
      if (currentBlock !== null) {
        tables.push(buildTable(currentBlock));
        currentBlock = null;
      }
    }
  }

  if (currentBlock !== null) {
    tables.push(buildTable(currentBlock));
  }

  return tables;
}

function buildTable(block: { startLine: number; lines: { lineIndex: number; text: string }[] }): ParsedTable {
  const columns = new Map<number, ColumnSpan[]>();
  for (const line of block.lines) {
    columns.set(line.lineIndex, parseColumns(line.text));
  }
  const lastLine = block.lines[block.lines.length - 1];
  return {
    startLine: block.startLine,
    endLine: lastLine.lineIndex,
    columns,
  };
}
