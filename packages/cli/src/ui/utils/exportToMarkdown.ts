/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
    Content,
} from '@google/genai';
import fs from 'fs/promises';


const ROLE_DISPLAY: Record<string, string> = {
  user: 'You',
  model: 'Gemini',
  unknown: 'Unknown',
};

export async function exportToMarkdown(
    content: Content[],
    tag?: string
): Promise<string> {

    const markdownContent = content
        .map(c => {
            const role = ROLE_DISPLAY[c.role || 'unknown'];
            const text = c.parts?.map(p => p.text).join('') || '';
            return `**${role}:**\n${text}`;
        })
        .join('\n\n')
        .replace(/```(.*?)\n([\s\S]*?)```/g, '```$1\n$2\n```');

    const filename = `chat_${tag || Date.now()}.md`;
    
    try {
        await fs.writeFile(filename, markdownContent, 'utf8');
        return filename;
    } catch (error) {
        console.error(`Failed to write markdown file: ${error}`);
        return '';
    }
}