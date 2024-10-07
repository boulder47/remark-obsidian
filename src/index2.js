import { remark } from 'remark';
import remarkParse from 'remark-parse';
import visit from 'unist-util-visit';

// Define a Remark plugin for Obsidian-specific syntax
function remarkObsidian() {
  return function (tree) {
    // Process Obsidian Wiki Links: [[WikiLink]]
    visit(tree, 'link', (node) => {
      const isWikiLink = node.url.startsWith('[['] && node.url.endsWith(']]');
      if (isWikiLink) {
        const linkContent = node.url.slice(2, -2); // Strip the [[ and ]]
        const parts = linkContent.split('|'); // Handle alias links [[Page|Alias]]
        node.url = parts[0];
        node.title = parts[1] || parts[0]; // Use alias if provided
      }
    });

    // Process Obsidian Callouts
    visit(tree, 'blockquote', (node) => {
      if (node.children[0]?.type === 'paragraph') {
        const firstChildText = node.children[0].children[0]?.value || '';
        const calloutMatch = firstChildText.match(/^>\s*\[!(\w+)\](.*)/);
        if (calloutMatch) {
          node.data = {
            calloutType: calloutMatch[1], // Type of callout (info, warning, etc.)
            calloutContent: calloutMatch[2].trim(), // Callout content
          };
        }
      }
    });

    // Process Obsidian Internal Links: [Link](obsidian://vault/Page)
    visit(tree, 'link', (node) => {
      const isInternalLink = node.url.startsWith('obsidian://');
      if (isInternalLink) {
        const linkTarget = node.url.replace('obsidian://', ''); // Extract the vault and page
        node.url = linkTarget;
        node.title = node.children[0].value || linkTarget;
      }
    });

    // Process Embeds: ![[EmbeddedNote]]
    visit(tree, 'image', (node) => {
      if (node.alt.startsWith('[[') && node.alt.endsWith(']]')) {
        const embedContent = node.alt.slice(2, -2); // Strip ![[ and ]]
        node.url = embedContent;
        node.alt = embedContent;
      }
    });

    // Process Obsidian Frontmatter
    visit(tree, 'yaml', (node) => {
      const isFrontmatter = node.value.startsWith('---') && node.value.endsWith('---');
      if (isFrontmatter) {
        node.type = 'frontmatter';
        node.data = {
          frontmatterContent: node.value, // Save the frontmatter as a field
        };
      }
    });

    // Process Obsidian Callouts (Advanced)
    visit(tree, 'blockquote', (node) => {
      const firstChild = node.children[0]?.value;
      if (firstChild?.startsWith('> [!')) {
        const calloutType = firstChild.match(/\[!(\w+)\]/)?.[1];
        node.type = 'callout';
        node.data = {
          type: calloutType,
        };
        node.children[0].value = firstChild.replace(`> [!${calloutType}]`, '').trim();
      }
    });
  };
}

// Example usage: Processing markdown content
const markdownContent = `
# Heading 1
This is a basic markdown text.

**Bold text** and *italic text*.

- List item 1
- List item 2

\`\`\`js
console.log("Code block");
\`\`\`

[[WikiLink]]
[[Page Title|Alias]]

![[EmbeddedNote]]

> [!info] Info callout with content.

[Internal Link](obsidian://vault/Page)
`;

remark()
  .use(remarkParse)
  .use(remarkObsidian)
  .process(markdownContent)
  .then((file) => {
    console.log(String(file));
  });
