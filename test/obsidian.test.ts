import { describe, it, expect } from 'vitest';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import remarkObsidian from '../src/index'; // Your plugin here

describe('remark-obsidian plugin', () => {
  it('should process wiki links', async () => {
    const markdownContent = 'This is a [[WikiLink]] example.';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .process(markdownContent);
       // Log the AST to inspect the node structure
      console.log(JSON.stringify(file, null, 2));

    let wikiLinkFound = false;
    
    visit(file, 'WikiLink', (node: any) => {
      if (node.value === 'WikiLink') {
        wikiLinkFound = true;
      }
    });

    expect(wikiLinkFound).toBe(true);
  });

  it('should process alias wiki links', async () => {
    const markdownContent = 'This is an alias link [[Page Title|Alias]].';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .process(markdownContent);
      console.log(JSON.stringify(file, null, 2));
    let aliasLinkFound = false;

    visit(file, 'AliasWikiLink', (node: any) => {
      if (node.value === 'Page Title|Alias') {
        aliasLinkFound = true;
      }
    });

    expect(aliasLinkFound).toBe(true);
  });

  it('should process embedded notes', async () => {
    const markdownContent = '![[EmbeddedNote]]';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .process(markdownContent);
      console.log(JSON.stringify(file, null, 2));
    let embeddedNoteFound = false;

    visit(file, 'Embedded', (node: any) => {
      if (node.value === 'EmbeddedNote') {
        embeddedNoteFound = true;
      }
    });

    expect(embeddedNoteFound).toBe(true);
  });

  it('should process internal obsidian links', async () => {
    const markdownContent = '[Internal Link](obsidian://vault/Page)';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .process(markdownContent);
      console.log(JSON.stringify(file, null, 2));
    let internalLinkFound = false;

    visit(file, 'link', (node: any) => {
      if (node.url === 'obsidian://vault/Page') {
        internalLinkFound = true;
      }
    });

    expect(internalLinkFound).toBe(true);
  });

  it('should process callouts', async () => {
    const markdownContent = '> [!info] Info callout with content.';

    const file = await remark()
      .use(remarkParse)
      .use(remarkObsidian)
      .process(markdownContent);
      console.log(JSON.stringify(file, null, 2));
    let calloutFound = false;

    visit(file, 'callout', (node: any) => {
      if (node.type === 'callout' && node.content === 'Info callout with content.') {
        calloutFound = true;
      }
    });
    console.log(JSON.stringify(file, null, 2));
    expect(calloutFound).toBe(true);
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
      .process(markdownContent);
      console.log(JSON.stringify(file, null, 2));
    let frontmatterTitleFound = false;
    let frontmatterAuthorFound = false;

    visit(file, 'yaml', (node: any) => {
      if (node.value.includes('title: "Frontmatter Title"')) {
        frontmatterTitleFound = true;
      }
      if (node.value.includes('author: "Author Name"')) {
        frontmatterAuthorFound = true;
      }
    });

    expect(frontmatterTitleFound).toBe(true);
    expect(frontmatterAuthorFound).toBe(true);
  });
});
