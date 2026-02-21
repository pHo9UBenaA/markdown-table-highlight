# Markdown Table Highlight

A VSCode extension that highlights table columns in Markdown to improve readability and visual clarity.

## Features

- Highlights columns in Markdown tables with cyclic colors
- Optional cursor column highlighting
- Optional single table mode (highlight only the table containing the cursor)

## Extension Settings

This extension works out of the box with no configuration required.
You can customize the following settings:

```jsonc
// Array of color strings (hex, rgba, rgb) used for columns.
// Colors are applied cyclically.
"markdownTableHighlight.colors": [
  "rgba(220,80,80,0.10)",
  "rgba(200,160,50,0.10)",
  "rgba(50,180,160,0.10)",
  "rgba(80,120,200,0.10)"
],

// Color for the cursor column highlight.
// Set to empty string "" to disable cursor column highlighting.
"markdownTableHighlight.cursorColor": "rgba(200,100,160,0.18)",

// Highlight only the table containing the cursor (default: false).
"markdownTableHighlight.singleTable": false,

// Delay in milliseconds before updating highlights (default: 100).
"markdownTableHighlight.updateDelay": 100,
```
