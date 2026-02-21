import { describe, test, expect } from "vitest";
import fc from "fast-check";
import { calculateHighlights } from "./decorationRanges";
import { ParsedTable } from "./tableParser";

describe("calculateHighlights", () => {
  test("assigns cyclic color indices to columns, no cursor decorations", () => {
    const table: ParsedTable = {
      startLine: 0,
      endLine: 0,
      columns: new Map([
        [0, [
          { startChar: 1, endChar: 4, columnIndex: 0 },
          { startChar: 5, endChar: 8, columnIndex: 1 },
        ]],
      ]),
    };
    const result = calculateHighlights([table], null, {
      colorCount: 4,
      cursorColorEnabled: false,
      singleTable: false,
    });
    expect(result.columnDecorations).toHaveLength(2);
    expect(result.columnDecorations[0]).toEqual({
      line: 0,
      startChar: 1,
      endChar: 4,
      colorIndex: 0,
    });
    expect(result.columnDecorations[1]).toEqual({
      line: 0,
      startChar: 5,
      endChar: 8,
      colorIndex: 1,
    });
    expect(result.cursorDecorations).toEqual([]);
  });

  test("color indices cycle with colorCount", () => {
    const table: ParsedTable = {
      startLine: 0,
      endLine: 0,
      columns: new Map([
        [0, [
          { startChar: 1, endChar: 4, columnIndex: 0 },
          { startChar: 5, endChar: 8, columnIndex: 1 },
          { startChar: 9, endChar: 12, columnIndex: 2 },
          { startChar: 13, endChar: 16, columnIndex: 3 },
        ]],
      ]),
    };
    const result = calculateHighlights([table], null, {
      colorCount: 2,
      cursorColorEnabled: false,
      singleTable: false,
    });
    const indices = result.columnDecorations.map((d) => d.colorIndex);
    expect(indices).toEqual([0, 1, 0, 1]);
  });

  test("cursor column is highlighted when cursorColorEnabled", () => {
    const table: ParsedTable = {
      startLine: 0,
      endLine: 1,
      columns: new Map([
        [0, [
          { startChar: 1, endChar: 4, columnIndex: 0 },
          { startChar: 5, endChar: 8, columnIndex: 1 },
        ]],
        [1, [
          { startChar: 1, endChar: 4, columnIndex: 0 },
          { startChar: 5, endChar: 8, columnIndex: 1 },
        ]],
      ]),
    };
    const result = calculateHighlights([table], { line: 0, character: 2 }, {
      colorCount: 4,
      cursorColorEnabled: true,
      singleTable: false,
    });
    // cursorDecorations should contain column 0 spans from all rows
    expect(result.cursorDecorations).toHaveLength(2);
    expect(result.cursorDecorations[0]).toEqual({
      line: 0, startChar: 1, endChar: 4, colorIndex: 0,
    });
    expect(result.cursorDecorations[1]).toEqual({
      line: 1, startChar: 1, endChar: 4, colorIndex: 0,
    });
  });

  test("no cursor decorations when cursor is outside tables", () => {
    const table: ParsedTable = {
      startLine: 0,
      endLine: 1,
      columns: new Map([
        [0, [
          { startChar: 1, endChar: 4, columnIndex: 0 },
          { startChar: 5, endChar: 8, columnIndex: 1 },
        ]],
        [1, [
          { startChar: 1, endChar: 4, columnIndex: 0 },
          { startChar: 5, endChar: 8, columnIndex: 1 },
        ]],
      ]),
    };
    const result = calculateHighlights([table], { line: 99, character: 0 }, {
      colorCount: 4,
      cursorColorEnabled: true,
      singleTable: false,
    });
    expect(result.cursorDecorations).toEqual([]);
  });

  test("singleTableMode highlights only the table containing cursor", () => {
    const table1: ParsedTable = {
      startLine: 0,
      endLine: 2,
      columns: new Map([
        [0, [{ startChar: 1, endChar: 4, columnIndex: 0 }]],
        [1, [{ startChar: 1, endChar: 4, columnIndex: 0 }]],
        [2, [{ startChar: 1, endChar: 4, columnIndex: 0 }]],
      ]),
    };
    const table2: ParsedTable = {
      startLine: 5,
      endLine: 7,
      columns: new Map([
        [5, [{ startChar: 1, endChar: 4, columnIndex: 0 }]],
        [6, [{ startChar: 1, endChar: 4, columnIndex: 0 }]],
        [7, [{ startChar: 1, endChar: 4, columnIndex: 0 }]],
      ]),
    };
    const result = calculateHighlights([table1, table2], { line: 6, character: 2 }, {
      colorCount: 4,
      cursorColorEnabled: false,
      singleTable: true,
    });
    // Only table2 decorations
    expect(result.columnDecorations).toHaveLength(3);
    result.columnDecorations.forEach((d) => {
      expect(d.line).toBeGreaterThanOrEqual(5);
      expect(d.line).toBeLessThanOrEqual(7);
    });
  });

  test("singleTableMode with cursor outside tables produces no decorations", () => {
    const table: ParsedTable = {
      startLine: 0,
      endLine: 2,
      columns: new Map([
        [0, [{ startChar: 1, endChar: 4, columnIndex: 0 }]],
        [1, [{ startChar: 1, endChar: 4, columnIndex: 0 }]],
        [2, [{ startChar: 1, endChar: 4, columnIndex: 0 }]],
      ]),
    };
    const result = calculateHighlights([table], { line: 99, character: 0 }, {
      colorCount: 4,
      cursorColorEnabled: false,
      singleTable: true,
    });
    expect(result.columnDecorations).toEqual([]);
  });

  test("each table starts color cycling from 0", () => {
    const table1: ParsedTable = {
      startLine: 0,
      endLine: 0,
      columns: new Map([
        [0, [
          { startChar: 1, endChar: 4, columnIndex: 0 },
          { startChar: 5, endChar: 8, columnIndex: 1 },
          { startChar: 9, endChar: 12, columnIndex: 2 },
        ]],
      ]),
    };
    const table2: ParsedTable = {
      startLine: 3,
      endLine: 3,
      columns: new Map([
        [3, [
          { startChar: 1, endChar: 4, columnIndex: 0 },
          { startChar: 5, endChar: 8, columnIndex: 1 },
        ]],
      ]),
    };
    const result = calculateHighlights([table1, table2], null, {
      colorCount: 4,
      cursorColorEnabled: false,
      singleTable: false,
    });
    // table1: colorIndex 0, 1, 2
    // table2: colorIndex should restart from 0
    expect(result.columnDecorations).toHaveLength(5);
    // table2's first column should be colorIndex 0
    const table2Decorations = result.columnDecorations.filter((d) => d.line === 3);
    expect(table2Decorations[0].colorIndex).toBe(0);
    expect(table2Decorations[1].colorIndex).toBe(1);
  });

  describe("PBT", () => {
    /** Generate a ParsedTable with arbitrary dimensions */
    const arbParsedTable = fc
      .record({
        startLine: fc.integer({ min: 0, max: 100 }),
        rowCount: fc.integer({ min: 1, max: 5 }),
        colCount: fc.integer({ min: 1, max: 6 }),
      })
      .map(({ startLine, rowCount, colCount }) => {
        const columns = new Map<number, { startChar: number; endChar: number; columnIndex: number }[]>();
        for (let r = 0; r < rowCount; r++) {
          const spans = [];
          for (let c = 0; c < colCount; c++) {
            const sc = 1 + c * 5;
            spans.push({ startChar: sc, endChar: sc + 3, columnIndex: c });
          }
          columns.set(startLine + r, spans);
        }
        const table: ParsedTable = {
          startLine,
          endLine: startLine + rowCount - 1,
          columns,
        };
        return table;
      });

    test("colorIndex is always in [0, colorCount)", () => {
      fc.assert(
        fc.property(
          fc.array(arbParsedTable, { minLength: 1, maxLength: 3 }),
          fc.integer({ min: 1, max: 10 }),
          (tables, colorCount) => {
            const result = calculateHighlights(tables, null, {
              colorCount,
              cursorColorEnabled: false,
              singleTable: false,
            });
            for (const d of result.columnDecorations) {
              expect(d.colorIndex).toBeGreaterThanOrEqual(0);
              expect(d.colorIndex).toBeLessThan(colorCount);
            }
          },
        ),
      );
    });

    test("singleTable output lines are within the cursor's table range", () => {
      fc.assert(
        fc.property(
          arbParsedTable,
          fc.integer({ min: 1, max: 10 }),
          (table, colorCount) => {
            const cursor = { line: table.startLine, character: 2 };
            const result = calculateHighlights([table], cursor, {
              colorCount,
              cursorColorEnabled: false,
              singleTable: true,
            });
            for (const d of result.columnDecorations) {
              expect(d.line).toBeGreaterThanOrEqual(table.startLine);
              expect(d.line).toBeLessThanOrEqual(table.endLine);
            }
          },
        ),
      );
    });

    test("cursorColorEnabled=false always produces empty cursorDecorations", () => {
      fc.assert(
        fc.property(
          fc.array(arbParsedTable, { minLength: 1, maxLength: 3 }),
          fc.integer({ min: 1, max: 10 }),
          fc.option(fc.record({ line: fc.integer({ min: 0, max: 100 }), character: fc.integer({ min: 0, max: 50 }) })),
          (tables, colorCount, cursor) => {
            const result = calculateHighlights(tables, cursor ?? null, {
              colorCount,
              cursorColorEnabled: false,
              singleTable: false,
            });
            expect(result.cursorDecorations).toEqual([]);
          },
        ),
      );
    });
  });
});
