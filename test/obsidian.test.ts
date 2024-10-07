import { describe, it, expect } from 'vitest';
import { remark } from 'remark';
import { remarkParse } from 'remark-parse';
import { remarkStringify } from 'remark-stringify'; // Add this
import { remarkObsidian } from '../src/index'; // Import your plugin here

describe('remark-obsidian plugin', () => {
  it('should process wiki links', async () => {
    const markdownContent = 'This is a [[WikiLink]] example.';
    
    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('[[WikiLink]]');
  });

  it('should process alias wiki links', async () => {
    const markdownContent = 'This is an alias link [[Page Title|Alias]].';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('[[Page Title|Alias]]');
  });

  it('should process embedded notes', async () => {
    const markdownContent = '![[EmbeddedNote]]';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('![[EmbeddedNote]]');
  });

  it('should process internal obsidian links', async () => {
    const markdownContent = '[Internal Link](obsidian://vault/Page)';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('[Internal Link](obsidian://vault/Page)');
  });

  it('should process callouts', async () => {
    const markdownContent = '> [!info] Info callout with content.';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('> [!info] Info callout with content.');
  });

  it('should process bold and italic formatting', async () => {
    const markdownContent = '**Bold text** and *italic text*.';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('**Bold text**');
    expect(String(file)).toContain('*italic text*');
  });

  it('should process headers', async () => {
    const markdownContent = '# Heading 1\n## Heading 2\n### Heading 3';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('# Heading 1');
    expect(String(file)).toContain('## Heading 2');
    expect(String(file)).toContain('### Heading 3');
  });

  it('should process lists', async () => {
    const markdownContent = '- List item 1\n- List item 2\n- List item 3';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('- List item 1');
    expect(String(file)).toContain('- List item 2');
    expect(String(file)).toContain('- List item 3');
  });

  it('should process code blocks', async () => {
    const markdownContent = '```js\nconsole.log("Hello World");\n```';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('```js\nconsole.log("Hello World");\n```');
  });

  it('should process frontmatter', async () => {
    const markdownContent = `---
title: "Frontmatter Title"
author: "Author Name"
tags: ["tag1", "tag2"]
---`;

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .use(remarkStringify, { bullet: '-', fences: true, entities: false }) // Disable escaping
      .process(markdownContent);

    expect(String(file)).toContain('title: "Frontmatter Title"');
    expect(String(file)).toContain('author: "Author Name"');
    expect(String(file)).toContain('tags: ["tag1", "tag2"]');
  });
});
