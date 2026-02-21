# Phase 5: Polish & Packaging

- `.vscode/launch.json` — Extension Development Host起動設定 (preLaunchTask: `npm: watch`)
- `README.md` — 機能概要 + 4設定のドキュメント
- `development.md` — 開発手順
- `.vsix` パッケージング: `./node_modules/.bin/vsce package --allow-missing-repository`

## 検証

1. `.vsix` ファイルが生成される
2. Extension Development Hostで全機能が動作する
