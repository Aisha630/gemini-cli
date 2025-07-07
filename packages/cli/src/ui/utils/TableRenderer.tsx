/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { Text, Box } from 'ink';
import stringWidth from 'string-width';
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
    const headerWidth = header.length;
    const maxRowWidth = Math.max(
      ...rows.map((row) => stringWidth(row[index] || '')),
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

  // Helper function to calculate the wrapped height of text
  const getWrappedHeight = useCallback((text: string, width: number) => {
    if (width <= 0) return 1;
    const lines = text.split(/\n|<br\s*\/?>/gi);
    let totalLines = 0;
    for (const line of lines) {
      totalLines += Math.ceil(stringWidth(line) / width);
    }
    return Math.max(1, totalLines);
  }, []); 

  // Helper function to get the height of a row (max height among all cells)
  const getRowHeight = useCallback(
    (cells: string[]) : number => {
      return Math.max(
        ...cells.map((cell: string, index: number) => {
          const contentWidth = Math.max(0, adjustedWidths[index] - 2);
          return getWrappedHeight(cell, contentWidth);
        }),
      );
    },
    [adjustedWidths, getWrappedHeight], 
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

  const VerticalSeparator = React.memo(
    ({ content, rowHeight }: { content: string; rowHeight: number }) => (
      <Text>{Array.from({ length: rowHeight }, () => content).join('\n')}</Text>
    ),
  );

  const renderRow = (cells: string[], isHeader = false) => {
    const rowHeight = getRowHeight(cells);

    return (
      <Box flexDirection="row" height={rowHeight + 1}>
        <VerticalSeparator content="│ " rowHeight={rowHeight + 1} />
        {cells.map((cell, index) => (
          <React.Fragment key={index}>
            {renderCell(cell, adjustedWidths[index], rowHeight, isHeader)}
            <VerticalSeparator content=" │ " rowHeight={rowHeight + 1} />
          </React.Fragment>
        ))}
      </Box>
    );
  };

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
      {renderRow(headers, true)}
      {renderSeparator()}
      {rows.map((row, index) => (
        <React.Fragment key={index}>{renderRow(row)}</React.Fragment>
      ))}
      {renderBottomBorder()}
    </Box>
  );
};
