import { describe, it, expect } from 'vitest';
import { remark } from 'remark';
import remarkObsidian from '../src/index';  // Adjust path based on your project structure

describe('remark-obsidian plugin', () => {

  it('should process wiki links', () => {
    const markdownContent = 'This is a [[WikiLink]] example.';

    const result = remark()
      .use(remarkObsidian)
      .processSync(markdownContent)
      .toString();

    // Replace this with the actual expected output from the plugin
    expect(result).toBe('This is a [[WikiLink]] example.');
  });

  it('should handle alias links', () => {
    const markdownContent = 'This is an alias link [[Page Title|Alias]].';

    const result = remark()
      .use(remarkObsidian)
      .processSync(markdownContent)
      .toString();

    // Replace this with the actual expected output from the plugin
    expect(result).toBe('This is an alias link [[Page Title|Alias]].');
  });

  it('should process internal links', () => {
    const markdownContent = '[Link Text](internal-link)';

    const result = remark()
      .use(remarkObsidian)
      .processSync(markdownContent)
      .toString();

    expect(result).toBe('[Link Text](internal-link)');  // Replace with actual expected output
  });

  it('should process embedded notes', () => {
    const markdownContent = '![[EmbeddedNote]]';

    const result = remark()
      .use(remarkObsidian)
      .processSync(markdownContent)
      .toString();

    // Replace this with the actual expected output from the plugin
    expect(result).toBe('![[EmbeddedNote]]');
  });

  // Add more tests for other features like handling front matter, parsing code blocks, etc.
});
