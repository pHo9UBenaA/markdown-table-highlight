# Phase 2: Table Parsing (TDD)

`src/tableParser.ts` — Markdownテキストからテーブルを検出し、各行のカラム境界を返す純粋関数。

## Interface

```typescript
export interface ColumnSpan {
  startChar: number;   // pipe直後
  endChar: number;     // pipe直前
  columnIndex: number;
}

export interface ParsedTable {
  startLine: number;
  endLine: number;
  columns: Map<number, ColumnSpan[]>;
}

export function parseTables(text: string): ParsedTable[];
```

## Key Regex

- Table line: `/^([ \t]*>)*[ \t]*\|[^\r\n]*$/`
- Column extraction: `/\|((\\.)|[^\\|])*(?=\|)/g`

## TDD Slices

1. 空テキスト → 空配列 (tracer bullet)
2. 単純テーブル (header + separator + data) → 1つのParsedTable
3. カラム境界のstartChar/endCharが正しい
4. エスケープされたpipe (`\|`) はセパレータとして扱わない
5. blockquote内テーブル
6. 複数テーブル (非テーブル行で分離)
7. 行ごとに異なるカラム数

## 検証

1. `npx vitest run` で全テスト通過
2. `npx tsc --noEmit` がエラーなし
