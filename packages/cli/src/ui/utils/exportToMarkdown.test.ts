/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// __tests__/markdownExporter.test.ts

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { exportToMarkdown } from './exportToMarkdown.js';

describe('exportToMarkdown', () => {
  it('formats a single user message', async () => {
    const content = [{ role: 'user', parts: [{ text: 'Hello' }] }];
    const filename = await exportToMarkdown(content, 'single');

    expect(typeof filename).toBe('string');
    expect(filename).toBe(`chat_single.md`);
    const md = readFileSync(path.resolve(process.cwd(), filename), 'utf8');

    expect(md).toContain('**You:**\nHello');
  });

  it('handles nested code blocks and assistant role', async () => {
    const content = [
      { role: 'model', parts: [{ text: '```js\nconsole.log(1);\n```' }] },
    ];

    const filename = await exportToMarkdown(content, 'code');

    expect(filename).toBe(`chat_code.md`);
    const md = readFileSync(path.resolve(process.cwd(), filename), 'utf8');

    expect(md).toContain('**Gemini:**');
    expect(md).toContain('js\nconsole.log(1);\n');
  });
});
