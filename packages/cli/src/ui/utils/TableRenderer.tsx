/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Text, Box } from 'ink';
import { wrappedLineCount, getPlainTextLength } from './textUtils.js';
import { Colors } from '../colors.js';
import { RenderInline } from './InlineMarkdownRenderer.js';

interface TableRendererProps {
  headers: string[];
  rows: string[][];
  terminalWidth: number;
}

/**
 * Custom table renderer for markdown tables
 * We implement our own instead of using ink-table due to module compatibility issues
 */
export const TableRenderer: React.FC<TableRendererProps> = ({
  headers,
  rows,
  terminalWidth,
}) => {
  // Calculate column widths
  const columnWidths = headers.map((header, index) => {
    const headerWidth = getPlainTextLength(header);
    const maxRowWidth = Math.max(
      ...rows.map((row) => getPlainTextLength(row[index] || '')),
    );
    return Math.max(headerWidth, maxRowWidth) + 2; // Add padding
  });

  // Ensure table fits within terminal width
  const totalWidth = columnWidths.reduce((sum, width) => sum + width + 1, 1);
  const scaleFactor =
    totalWidth > terminalWidth ? terminalWidth / totalWidth : 1;
  const minColWidth = 3;
  const adjustedWidths = columnWidths.map((w) =>
    Math.max(Math.floor(w * scaleFactor), minColWidth),
  );

  const headerHeight = Math.max(
    1,
    ...headers.map((hdr, ci) => wrappedLineCount(hdr, adjustedWidths[ci] - 2)),
  );

  // Row Height after taking into account wrapped content
  const rowHeights = rows.map((cells) =>
    Math.max(
      1,
      ...cells.map((cell, ci) =>
        wrappedLineCount(cell, adjustedWidths[ci] - 2),
      ),
    ),
  );

  const renderCell = (
    content: string,
    width: number,
    height: number,
    isHeader = false,
  ) => {
    // The actual space for content inside the padding
    const contentWidth = Math.max(0, width - 2);

    const textComponent = isHeader ? (
      <Text bold color={Colors.AccentCyan}>
        <RenderInline text={content} />
      </Text>
    ) : (
      <Text>
        <RenderInline text={content} />
      </Text>
    );

    return (
      <Box width={contentWidth} height={height} flexDirection="column">
        {textComponent}
      </Box>
    );
  };

  function VerticalSeparatorInternal({
    content,
    rowHeight,
  }: {
    content: string;
    rowHeight: number;
  }) {
    return (
      <Text>{Array.from({ length: rowHeight }, () => content).join('\n')}</Text>
    );
  }

  const VerticalSeparator = React.memo(VerticalSeparatorInternal);

  // Adding an extra blank line with height+1 on purpose since it looks better/easier to visuallyseparate cells in more dense tables
  const renderRow = (cells: string[], height: number, isHeader = false) => (
    <Box flexDirection="row" height={height + 1}>
      <VerticalSeparator content="│ " rowHeight={height + 1} />
      {cells.map((content, ci) => (
        <React.Fragment key={ci}>
          {renderCell(content, adjustedWidths[ci], height, isHeader)}
          <VerticalSeparator
            content={ci < cells.length - 1 ? ' │ ' : ' │'}
            rowHeight={height + 1}
          />
        </React.Fragment>
      ))}
    </Box>
  );

  const renderSeparator = () => {
    const separator = adjustedWidths
      .map((width) => '─'.repeat(Math.max(0, (width || 0) - 2)))
      .join('─┼─');
    return <Text>├─{separator}─┤</Text>;
  };

  const renderTopBorder = () => {
    const border = adjustedWidths
      .map((width) => '─'.repeat(Math.max(0, (width || 0) - 2)))
      .join('─┬─');
    return <Text>┌─{border}─┐</Text>;
  };

  const renderBottomBorder = () => {
    const border = adjustedWidths
      .map((width) => '─'.repeat(Math.max(0, (width || 0) - 2)))
      .join('─┴─');
    return <Text>└─{border}─┘</Text>;
  };

  return (
    <Box flexDirection="column" marginY={1}>
      {renderTopBorder()}
      {renderRow(headers, headerHeight, true)}
      {renderSeparator()}
      {rows.map((r, i) => renderRow(r, rowHeights[i]))}
      {renderBottomBorder()}
    </Box>
  );
};
