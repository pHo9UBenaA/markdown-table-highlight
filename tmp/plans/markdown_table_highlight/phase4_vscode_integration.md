# Phase 4: VSCode Integration

## `src/decorationManager.ts`

`DecorationManager` クラス: TextEditorDecorationType の生成・適用・破棄。
- `constructor(colors, cursorColor)` — cursorColor が null/空文字なら cursorDecorationType を作成しない
- `applyDecorations(editor, result)` — HighlightResult → editor.setDecorations
- `dispose()` / `recreate(colors, cursorColor)`

## `src/extension.ts`

- Config section: `markdownTableHighlight`
- `activate`: 設定読み込み → DecorationManager生成 → イベントリスナー登録
- Events: onDidChangeActiveTextEditor, onDidChangeTextEditorSelection, onDidChangeTextDocument, onDidChangeConfiguration
- Throttling: setTimeout + clearTimeout (updateDelay)
- cursorColorEnabled は `cursorColor !== ""` で判定

## 検証

1. `npx tsc --noEmit` がエラーなし
2. `npm run compile` でビルド成功
3. `npx vitest run` で全テスト通過
