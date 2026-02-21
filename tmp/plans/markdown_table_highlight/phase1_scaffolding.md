# Phase 1: Project Scaffolding

## Overview

Markdownテーブルのカラムを色分けハイライトするVSCode拡張機能。TDDで純粋ロジックをテスト駆動開発し、VSCode APIとの統合は薄いレイヤーにする。

## Settings

```jsonc
"markdownTableHighlight.colors": ["rgba(220,80,80,0.10)", "rgba(200,160,50,0.10)", "rgba(50,180,160,0.10)", "rgba(80,120,200,0.10)"],
"markdownTableHighlight.cursorColor": "rgba(200,100,160,0.18)",  // 空文字で無効化
"markdownTableHighlight.singleTable": false,
"markdownTableHighlight.updateDelay": 100,
```

## File Structure

```
src/
  tableParser.ts          # Pure: markdown table parsing
  tableParser.test.ts     # 7 tests
  decorationRanges.ts     # Pure: color index calculation
  decorationRanges.test.ts # 7 tests
  decorationManager.ts    # VSCode decoration type management
  extension.ts            # Entry point, event wiring, throttling
```

## 目的

プロジェクト基盤の構築。`npm install` → `npx tsc --noEmit` → `npx vitest run` が動作する状態にする。

## 作成ファイル

`package.json`, `tsconfig.json`, `webpack.config.js`, `vitest.config.ts`, `.gitignore`, `.vscodeignore`, `src/extension.ts` (スタブ), `src/tableParser.ts`, `src/decorationRanges.ts`, `src/decorationManager.ts` (空モジュール)

## 検証

1. `npm install` が成功する
2. `npx tsc --noEmit` がエラーなく完了する
3. `npx vitest run` が 0 テストでパスする
