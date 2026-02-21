import { describe, test, expect } from "vitest";
import fc from "fast-check";
import { parseTables } from "./tableParser";

describe("parseTables", () => {
  test("returns empty array for empty text", () => {
    expect(parseTables("")).toEqual([]);
  });

  test("parses a simple table with header, separator, and data row", () => {
    const text = "| a | b |\n| --- | --- |\n| 1 | 2 |";
    const result = parseTables(text);
    expect(result).toHaveLength(1);
    expect(result[0].startLine).toBe(0);
    expect(result[0].endLine).toBe(2);
    expect(result[0].columns.size).toBe(3); // 3行分
  });

  test("column spans have correct startChar and endChar", () => {
    const text = "| ab | cde |";
    const result = parseTables(text);
    const spans = result[0].columns.get(0)!;
    // "| ab | cde |"
    // 0123456789...
    expect(spans[0]).toEqual({ startChar: 1, endChar: 4, columnIndex: 0 }); // " ab "
    expect(spans[1]).toEqual({ startChar: 6, endChar: 10, columnIndex: 1 }); // " cde "
  });

  test("escaped pipes are not treated as column separators", () => {
    const text = "| foo \\| bar | baz |";
    const result = parseTables(text);
    const spans = result[0].columns.get(0)!;
    expect(spans).toHaveLength(2);
    // "foo \| bar" is one column
  });

  test("parses tables inside blockquotes", () => {
    const text = "> | a | b |\n> | --- | --- |\n> | 1 | 2 |";
    const result = parseTables(text);
    expect(result).toHaveLength(1);
    // startChar/endCharはblockquoteプレフィックスを含む行全体の中の位置
    const spans = result[0].columns.get(0)!;
    expect(spans).toHaveLength(2);
    // "> | a | b |"
    // 0123456789...
    expect(spans[0].startChar).toBe(3); // after "> |"
  });

  test("parses multiple tables separated by non-table lines", () => {
    const text = "| a |\n\nsome text\n\n| b |";
    const result = parseTables(text);
    expect(result).toHaveLength(2);
    expect(result[0].startLine).toBe(0);
    expect(result[0].endLine).toBe(0);
    expect(result[1].startLine).toBe(4);
    expect(result[1].endLine).toBe(4);
  });

  test("handles rows with different column counts", () => {
    const text = "| a | b | c |\n| 1 | 2 |";
    const result = parseTables(text);
    expect(result[0].columns.get(0)!).toHaveLength(3);
    expect(result[0].columns.get(1)!).toHaveLength(2);
  });

  describe("PBT", () => {
    /** Generate a markdown table cell content (no pipes or newlines) */
    const arbCell = fc.stringMatching(/^[a-z0-9 -]{1,5}$/);

    /** Generate a markdown table row with N columns */
    const arbTableRow = (cols: number) =>
      fc
        .array(arbCell, { minLength: cols, maxLength: cols })
        .map((cells) => "| " + cells.join(" | ") + " |");

    /** Generate a full markdown table (1-5 rows, 1-6 columns) */
    const arbTable = fc
      .record({
        cols: fc.integer({ min: 1, max: 6 }),
        rows: fc.integer({ min: 1, max: 5 }),
      })
      .chain(({ cols, rows }) =>
        fc.array(arbTableRow(cols), { minLength: rows, maxLength: rows }),
      )
      .map((rows) => rows.join("\n"));

    test("output invariants: startChar <= endChar, columnIndex sequential per row", () => {
      fc.assert(
        fc.property(arbTable, (tableText) => {
          const tables = parseTables(tableText);
          for (const table of tables) {
            expect(table.startLine).toBeLessThanOrEqual(table.endLine);
            for (const [, spans] of table.columns) {
              for (let i = 0; i < spans.length; i++) {
                expect(spans[i].startChar).toBeLessThanOrEqual(spans[i].endChar);
                expect(spans[i].columnIndex).toBe(i);
              }
            }
          }
        }),
      );
    });

    test("non-table text returns empty array", () => {
      const arbNonTableLine = fc.stringMatching(/^[a-zA-Z0-9 .,:!?#-]{0,20}$/);

      fc.assert(
        fc.property(
          fc.array(arbNonTableLine, { minLength: 0, maxLength: 5 }).map((lines) => lines.join("\n")),
          (text) => {
            expect(parseTables(text)).toEqual([]);
          },
        ),
      );
    });

    test("number of parsed tables equals number of contiguous table-row blocks", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.oneof(arbTable, fc.constant("some plain text")),
            { minLength: 1, maxLength: 4 },
          ),
          (segments) => {
            const text = segments.join("\n\n");
            const tables = parseTables(text);
            // Count table segments in input
            const tableSegmentCount = segments.filter((s) => s.includes("|")).length;
            expect(tables.length).toBe(tableSegmentCount);
          },
        ),
      );
    });
  });
});
