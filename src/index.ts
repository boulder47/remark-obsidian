import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

interface WikiLinkNode {
  type: 'wikiLink';
  value: string;
  alias?: string;
}

interface CalloutNode {
  type: 'callout';
  value: string;
  calloutType: string;
}

interface FrontmatterNode {
  type: 'yaml';
  value: string;
}

const remarkObsidian: Plugin = () => {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (node.type === 'text' && typeof node.value === 'string') {
        const value = node.value;

        // Handle Wiki Links
        const wikiLinkPattern = /\\?\[\[([^\|\]]+)\|?([^\]]*)\]\]/g;
        let match;
        const newChildren: any[] = [];
        let lastIndex = 0;

        while ((match = wikiLinkPattern.exec(value)) !== null) {
          const [fullMatch, page, alias] = match;

          // Add any text before the wiki link
          if (match.index > lastIndex) {
            newChildren.push({
              type: 'text',
              value: value.slice(lastIndex, match.index),
            });
          }

          // Add the wiki link node
          newChildren.push({
            type: 'wikiLink',
            value: page,
            alias: alias || undefined,
          });

          lastIndex = wikiLinkPattern.lastIndex;
        }

        // Add remaining text after the last match
        if (lastIndex < value.length) {
          newChildren.push({
            type: 'text',
            value: value.slice(lastIndex),
          });
        }

        // If any wiki link is found, replace the original node with new children
        if (newChildren.length > 0 && parent) {
          parent.children.splice(index, 1, ...newChildren);
        }

        // Handle Callouts
        const calloutPattern = /> \[!(\w+)\]\s*(.*)/;
        const calloutMatch = calloutPattern.exec(value);

        if (calloutMatch) {
          const [, calloutType, content] = calloutMatch;

          const calloutNode: CalloutNode = {
            type: 'callout',
            value: content.trim(),
            calloutType,
          };

          parent.children.splice(index, 1, calloutNode);
        }
      }
    });

    // Handle Frontmatter (if needed)
    visit(tree, 'yaml', (node) => {
      const frontmatterNode: FrontmatterNode = {
        type: 'yaml',
        value: node.value,
      };
      // Replace or handle the YAML frontmatter node as needed
    });
  };
};

export default remarkObsidian;
