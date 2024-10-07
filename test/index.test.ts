import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkObsidian from './path-to-plugin';

const markdown = `
---
title: My Note
---

This is an alias link [[Page Title|Alias]].

> [!info] Info callout with content.
`;

remark()
  .use(remarkParse)
  .use(remarkObsidian)
  .process(markdown)
  .then((file) => {
    console.log(JSON.stringify(file, null, 2));
  });
