# Phase 3: Decoration Range Calculation (TDD)

`src/decorationRanges.ts` — ParsedTable + カーソル位置 → 各セルにどの色インデックスを適用するか。

## Interface

```typescript
export interface DecorationAssignment {
  line: number;
  startChar: number;
  endChar: number;
  colorIndex: number;
}

export interface CursorPosition { line: number; character: number; }

export interface HighlightOptions {
  colorCount: number;
  cursorColorEnabled: boolean;
  singleTable: boolean;
}

export interface HighlightResult {
  columnDecorations: DecorationAssignment[];
  cursorDecorations: DecorationAssignment[];
}

export function calculateHighlights(
  tables: ParsedTable[],
  cursor: CursorPosition | null,
  options: HighlightOptions,
): HighlightResult;
```

## TDD Slices

1. 1テーブル、カーソルなし → cyclic color index (tracer bullet)
2. colorCount=2, 4カラム → 0,1,0,1
3. cursorColorEnabled + カーソルがセル内 → cursorDecorations
4. カーソルがテーブル外 → cursorDecorations空
5. singleTable=true → カーソルのあるテーブルのみ
6. singleTable=true + カーソルがテーブル外 → デコレーションなし
7. 複数テーブル → 各テーブルで色インデックスが0からリセット

## 検証

1. `npx vitest run` で全テスト通過
2. `npx tsc --noEmit` がエラーなし
