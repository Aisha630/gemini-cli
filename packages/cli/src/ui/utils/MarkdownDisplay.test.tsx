/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from 'ink-testing-library';
import { MarkdownDisplay } from './MarkdownDisplay.js';

describe('MarkdownDisplay', () => {
  describe('Table Rendering', () => {
    it('should render a simple table', () => {
      const tableMarkdown = `
| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |
`;

      const { lastFrame } = render(
        <MarkdownDisplay
          text={tableMarkdown}
          isPending={false}
          terminalWidth={80}
        />,
      );

      expect(lastFrame()).toContain('Name');
      expect(lastFrame()).toContain('Age');
      expect(lastFrame()).toContain('City');
      expect(lastFrame()).toContain('John');
      expect(lastFrame()).toContain('25');
      expect(lastFrame()).toContain('NYC');
      expect(lastFrame()).toContain('Jane');
      expect(lastFrame()).toContain('30');
      expect(lastFrame()).toContain('LA');
    });

    it('should handle tables with varying column widths', () => {
      const tableMarkdown = `
| Short | Medium Column | Very Long Column Name |
|-------|---------------|----------------------|
| A     | Some text     | This is a longer text content |
| B     | More content  | Another piece of content here |
`;

      const { lastFrame } = render(
        <MarkdownDisplay
          text={tableMarkdown}
          isPending={false}
          terminalWidth={80}
        />,
      );

      expect(lastFrame()).toContain('Short');
      expect(lastFrame()).toContain('Medium Column');
      expect(lastFrame()).toContain('Very Long Column Name');
    });

    it('should handle empty cells in tables', () => {
      const tableMarkdown = `
| Col1 | Col2 | Col3 |
|------|------|------|
| A    |      | C    |
|      | B    |      |
`;

      const { lastFrame } = render(
        <MarkdownDisplay
          text={tableMarkdown}
          isPending={false}
          terminalWidth={80}
        />,
      );

      expect(lastFrame()).toContain('Col1');
      expect(lastFrame()).toContain('Col2');
      expect(lastFrame()).toContain('Col3');
      expect(lastFrame()).toContain('A');
      expect(lastFrame()).toContain('B');
      expect(lastFrame()).toContain('C');
    });

    it('should handle mixed content with tables', () => {
      const mixedMarkdown = `
# Header

Some paragraph text before the table.

| Feature | Status | Notes |
|---------|--------|-------|
| Auth    | Done   | OAuth |
| API     | WIP    | REST  |

Some text after the table.
`;

      const { lastFrame } = render(
        <MarkdownDisplay
          text={mixedMarkdown}
          isPending={false}
          terminalWidth={80}
        />,
      );

      expect(lastFrame()).toContain('Header');
      expect(lastFrame()).toContain('Some paragraph text before the table.');
      expect(lastFrame()).toContain('Feature');
      expect(lastFrame()).toContain('Status');
      expect(lastFrame()).toContain('Auth');
      expect(lastFrame()).toContain('Done');
      expect(lastFrame()).toContain('Some text after the table.');
    });

    it('should handle tables with empty cells at edges', () => {
      const tableMarkdown = `
| | Middle | |
|-|--------|-|
| | Value  | |
`;

      const { lastFrame } = render(
        <MarkdownDisplay
          text={tableMarkdown}
          isPending={false}
          terminalWidth={80}
        />,
      );

      expect(lastFrame()).toContain('Middle');
      expect(lastFrame()).toContain('Value');
      // Should maintain column structure even with empty edge cells
    });

    it('should handle PR reviewer test case 1', () => {
      const tableMarkdown = `
| Package | Lines of Code |
|---------|---------------|
| CLI     | 18407         |
| Core    | 14445         |
`;

      const { lastFrame } = render(
        <MarkdownDisplay
          text={tableMarkdown}
          isPending={false}
          terminalWidth={80}
        />,
      );

      const output = lastFrame();
      expect(output).toContain('Package');
      expect(output).toContain('Lines of Code');
      expect(output).toContain('CLI');
      expect(output).toContain('18407');
      expect(output).toContain('Core');
      expect(output).toContain('14445');
    });

    it('should handle PR reviewer test case 2 - long table', () => {
      const tableMarkdown = `
| Letter | Count |
|--------|-------|
| a      | 15    |
| b      | 2     |
| c      | 26    |
| Total  | 283   |
`;

      const { lastFrame } = render(
        <MarkdownDisplay
          text={tableMarkdown}
          isPending={false}
          terminalWidth={80}
        />,
      );

      const output = lastFrame();
      expect(output).toContain('Letter');
      expect(output).toContain('Count');
      expect(output).toContain('a');
      expect(output).toContain('15');
      expect(output).toContain('Total');
      expect(output).toContain('283');
    });

    it('should not render malformed tables', () => {
      const malformedMarkdown = `
| This looks like a table |
But there's no separator line
| So it shouldn't render as table |
`;

      const { lastFrame } = render(
        <MarkdownDisplay
          text={malformedMarkdown}
          isPending={false}
          terminalWidth={80}
        />,
      );

      // Should render as regular text, not a table
      expect(lastFrame()).toContain('| This looks like a table |');
      expect(lastFrame()).toContain("But there's no separator line");
      expect(lastFrame()).toContain("| So it shouldn't render as table |");
    });

    it('should not crash when rendering a very wide table in a narrow terminal', () => {
      const wideTable = `
| Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 | Col 7 | Col 8 | Col 9 | Col 10 |
|-------|-------|-------|-------|-------|-------|-------|-------|-------|--------|
| ${'a'.repeat(20)} | ${'b'.repeat(20)} | ${'c'.repeat(20)} | ${'d'.repeat(
        20,
      )} | ${'e'.repeat(20)} | ${'f'.repeat(20)} | ${'g'.repeat(20)} | ${'h'.repeat(
        20,
      )} | ${'i'.repeat(20)} | ${'j'.repeat(20)} |
    `;

      const renderNarrow = () =>
        render(
          <MarkdownDisplay
            text={wideTable}
            isPending={false}
            terminalWidth={40}
          />,
        );

      // The important part is that this does not throw an error.
      expect(renderNarrow).not.toThrow();

      // We can also check that it rendered *something*.
      const { lastFrame } = renderNarrow();
      expect(lastFrame()).not.toBe('');
    });
  });
});

describe('Existing Functionality', () => {
  it('should render headers correctly', () => {
    const headerMarkdown = `
# H1 Header
## H2 Header
### H3 Header
#### H4 Header
`;

    const { lastFrame } = render(
      <MarkdownDisplay
        text={headerMarkdown}
        isPending={false}
        terminalWidth={80}
      />,
    );

    expect(lastFrame()).toContain('H1 Header');
    expect(lastFrame()).toContain('H2 Header');
    expect(lastFrame()).toContain('H3 Header');
    expect(lastFrame()).toContain('H4 Header');
  });

  it('should render code blocks correctly', () => {
    const codeMarkdown = `
\`\`\`javascript
const x = 42;
console.log(x);
\`\`\`
`;

    const { lastFrame } = render(
      <MarkdownDisplay
        text={codeMarkdown}
        isPending={false}
        terminalWidth={80}
      />,
    );

    expect(lastFrame()).toContain('const x = 42;');
    expect(lastFrame()).toContain('console.log(x);');
  });
});

describe('Table Rendering Styles', () => {
  it('should render bold markdown inside table cells', () => {
    const boldTable = `
    | Col | Desc          |
    |-----|---------------|
    | **Foo** | Bar       |
    `;
    const { lastFrame } = render(
      <MarkdownDisplay text={boldTable} isPending={false} terminalWidth={80} />,
    );
    const output = lastFrame();
    // Markdown symbols should not appear in the rendered output
    expect(output).not.toContain('**Foo**');
    // The content should be present (without the markdown symbols)
    expect(output).toContain('Foo');
    expect(output).toContain('Bar');
    // Verify table structure is maintained
    expect(output).toContain('Col');
    expect(output).toContain('Desc');
  });

  it('should render italic markdown inside table cells', () => {
    const italicTable = `
    | Col | Desc          |
    |-----|---------------|
    | *Foo* | Bar        |
    `;
    const { lastFrame } = render(
      <MarkdownDisplay
        text={italicTable}
        isPending={false}
        terminalWidth={80}
      />,
    );
    const output = lastFrame();
    // Markdown symbols should not appear in the rendered output
    expect(output).not.toContain('*Foo*');
    // The content should be present (without the markdown symbols)
    expect(output).toContain('Foo');
    expect(output).toContain('Bar');
    // Verify table structure is maintained
    expect(output).toContain('Col');
    expect(output).toContain('Desc');
  });

  it('should render multiple markdown formats in table cells', () => {
    const complexTable = `
    | Format | Example | Notes |
    |--------|---------|-------|
    | **Bold** | *Italic* | \`Code\` |
    | ~~Strike~~ | [Link](url) | <u>Underline</u> |
    `;
    const { lastFrame } = render(
      <MarkdownDisplay
        text={complexTable}
        isPending={false}
        terminalWidth={100}
      />,
    );
    const output = lastFrame();

    expect(output).not.toContain('**Bold**');
    expect(output).not.toContain('*Italic*');
    expect(output).not.toContain('`Code`');
    expect(output).not.toContain('~~Strike~~');
    expect(output).not.toContain('[Link](url)');
    expect(output).not.toContain('<u>Underline</u>');

    expect(output).toContain('Bold');
    expect(output).toContain('Italic');
    expect(output).toContain('Code');
    expect(output).toContain('Strike');
    expect(output).toContain('Link');
    expect(output).toContain('Underline');

    expect(output).toContain('Format');
    expect(output).toContain('Example');
    expect(output).toContain('Notes');
  });

  it('should handle line breaks in table cells', () => {
    const tableWithBreaks = `
| Name | Description |
|------|-------------|
| Item 1 | First line<br>Second line |
| Item 2 | Another line<br>With break |
`;

    const { lastFrame } = render(
      <MarkdownDisplay
        text={tableWithBreaks}
        isPending={false}
        terminalWidth={80}
      />,
    );

    const output = lastFrame();
    expect(output).toContain('First line');
    expect(output).toContain('Second line');
    expect(output).toContain('Another line');
    expect(output).toContain('With break');
    // Should not contain the raw <br> tag
    expect(output).not.toContain('<br>');
  });

  it('should handle multiple line breaks in table cells', () => {
    const tableWithMultipleBreaks = `
| Column |
|--------|
| Line 1<br>Line 2<br>Line 3 |
`;

    const { lastFrame } = render(
      <MarkdownDisplay
        text={tableWithMultipleBreaks}
        isPending={false}
        terminalWidth={80}
      />,
    );

    const output = lastFrame();
    expect(output).toContain('Line 1');
    expect(output).toContain('Line 2');
    expect(output).toContain('Line 3');
  });

  it('should respect minimum column width in very narrow terminals', () => {
    const narrowTable = `
| A | B | C |
|---|---|---|
| 1 | 2 | 3 |
`;

    const { lastFrame } = render(
      <MarkdownDisplay
        text={narrowTable}
        isPending={false}
        terminalWidth={10} // Very narrow
      />,
    );

    const output = lastFrame();
    expect(output).toContain('A');
    expect(output).toContain('B');
    expect(output).toContain('C');
    expect(output).toContain('1');
    expect(output).toContain('2');
    expect(output).toContain('3');
  });

  it('should maintain table structure even with single character columns', () => {
    const singleCharTable = `
| X | Y | Z |
|---|---|---|
| a | b | c |
`;

    const { lastFrame } = render(
      <MarkdownDisplay
        text={singleCharTable}
        isPending={false}
        terminalWidth={15}
      />,
    );

    const output = lastFrame();
    expect(output).toContain('│');
    expect(output).toContain('─');
    expect(output).toContain(' X ');
    expect(output).toContain(' a ');
  });

  it('should properly wrap long text in table cells', () => {
    const longTextTable = `
| SHORT | Very Long Content |
|-------|-------------------|
| A     | This is a very long piece of text that should wrap properly within the cell boundaries |
`;

    const { lastFrame } = render(
      <MarkdownDisplay
        text={longTextTable}
        isPending={false}
        terminalWidth={50}
      />,
    );

    const output = lastFrame();
    expect(output).toContain('This is a very long');
    expect(output).toContain('S');
    expect(output).toContain('H');
    expect(output).toContain('O');
    expect(output).toContain('R');
    expect(output).toContain('T');
    expect(output).toContain('A');
  });

  it('should handle newlines and breaks together in wrapping', () => {
    const mixedBreaksTable = `
| Content |
|---------|
| Line 1\nLine 2<br>Line 3 |
`;

    const { lastFrame } = render(
      <MarkdownDisplay
        text={mixedBreaksTable}
        isPending={false}
        terminalWidth={80}
      />,
    );

    const output = lastFrame();
    expect(output).toContain('Line 1');
    expect(output).toContain('Line 2');
    expect(output).toContain('Line 3');
  });
});
