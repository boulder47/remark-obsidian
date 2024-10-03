import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import plugin, { Config } from "../src/index";
import { rehype } from "rehype";
import { it, expect, describe } from "vitest";

function normalizeHtml(html: string): string {
  return html.replace(/[\n\s]*(<)|>([\n\s]*)/g, (match, p1, p2) =>
    p1 ? "<" : ">"
  );
}

const runPluginFromHTML = async (input: string) => {
  const processor = rehype().use(plugin, { showIcon: false });

  // console.log(JSON.stringify(processor.parse(input), undefined, 2));

  return normalizeHtml(String(await processor.process(normalizeHtml(input))));
};

const runPluginFromMarkdown = async (
  input: string,
  config: Partial<Config> = { showIcon: false }
) => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(plugin, config)
    .use(rehypeStringify);

  // console.log(JSON.stringify(processor.parse(input), undefined, 2));

  // console.log(JSON.stringify(processor.parse(input), undefined, 2));

  // console.log(JSON.stringify(await processor.process(input), undefined, 2));

  return normalizeHtml(String(await processor.process(input)));
};

const templateOutput = (output: string) =>
  `<html><head></head><body>${output}</body></html>`;

describe("plugin used on HTML", () => {
  it("should handle basic callout", async () => {
    const html = `<blockquote>
        <p>[!note]</p>
        <p>stuff</p>
      </blockquote>`;

    const expectedOutput = templateOutput(
      `<div class="callout-type-note callout-block">
          <div class="callout-title-section">
              <p class="callout-title">Note</p>
          </div>
          <div class="callout-content-section">
              <p>stuff</p>
          </div>
      </div>`
    );

    expect(await runPluginFromHTML(html)).toBe(normalizeHtml(expectedOutput));
  });
});

/* markdown test cases */

const basic = `> [!note] This is a note callout.
>
> This is the content!`;

const noBlankAfterTitle = `> [!note] This is a note callout.
> This is the content!`;

const outputBasic = `<div class="callout-type-note callout-block">
<div class="callout-title-section">
    <p class="callout-title">This is a note callout.</p>
</div>
<div class="callout-content-section">
    <p>This is the content!</p>
</div>
</div>`;

const outputBasicWithIcon = `<div class="callout-type-note callout-block">
<div class="callout-title-section">
  <span class="callout-icon-wrapper">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="2" x2="22" y2="6"></line><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"></path></svg>
  </span>
  <p class="callout-title">This is a note callout.</p>
</div>
<div class="callout-content-section">
  <p>This is the content!</p>
</div>
</div>`;

/* -- */

const noTitle = `> [!note]
>
> This is the content!`;

const outputNoTitle = `<div class="callout-type-note callout-block">
<div class="callout-title-section">
    <p class="callout-title">Note</p>
</div>
<div class="callout-content-section">
    <p>This is the content!</p>
</div>
</div>`;

/* -- */

const markdownInTitle = `> [!note] this *is not* simple \`callout\`
>
> This is the content!`;

const noBlackAfterTitleWithMarkdown = `> [!note] this *is not* simple \`callout\`
> This is the content!`;

const outputMarkdownInTitle = `<div class="callout-type-note callout-block">
<div class="callout-title-section">
    <p class="callout-title">this <em>is not</em> simple <code>callout</code></p>
</div>
<div class="callout-content-section">
    <p>This is the content!</p>
</div>
</div>`;

/* -- */

const collapsibleCallout = `> [!warning]-
> Buff!`;

const outputCollapsibleCallout = `<details class="callout-type-warning callout-block callout-collapsible">
<summary class="callout-title-section">
    <p class="callout-title">Warning</p>
</summary>
<div class="callout-content-section">
    <p>Buff!</p>
</div>
</details>`;

/* -- */

const customCallout = `> [!custom]-
> Buff!`;

const outputcustomCallout = `<details class="callout-type-custom callout-block callout-collapsible">
<summary class="callout-title-section">
    <p class="callout-title">Custom default heading</p>
</summary>
<div class="callout-content-section">
    <p>Buff!</p>
</div>
</details>`;

const customIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;

const outputcustomCalloutWithIcon = `<details class="callout-type-custom callout-block callout-collapsible">
<summary class="callout-title-section">
    <span class="callout-icon-wrapper">
        ${customIcon}
    </span>
    <p class="callout-title">Custom default heading</p>
</summary>
<div class="callout-content-section">
    <p>Buff!</p>
</div>
</details>`;

/* -- */

describe("integration test", () => {
  it("should handle basic callout", async () => {
    expect(await runPluginFromMarkdown(basic)).toBe(normalizeHtml(outputBasic));
  });

  it("should handle basic callout with no blank", async () => {
    expect(await runPluginFromMarkdown(noBlankAfterTitle)).toBe(
      normalizeHtml(outputBasic)
    );
  });

  it("should handle markdown in title", async () => {
    expect(await runPluginFromMarkdown(markdownInTitle)).toBe(
      normalizeHtml(outputMarkdownInTitle)
    );
  });

  it("should handle markdown in title with no blank", async () => {
    expect(await runPluginFromMarkdown(noBlackAfterTitleWithMarkdown)).toBe(
      normalizeHtml(outputMarkdownInTitle)
    );
  });

  it("should add default title", async () => {
    expect(await runPluginFromMarkdown(noTitle)).toBe(
      normalizeHtml(outputNoTitle)
    );
  });

  it("should handle collapsible callout", async () => {
    expect(await runPluginFromMarkdown(collapsibleCallout)).toBe(
      normalizeHtml(outputCollapsibleCallout)
    );
  });

  it("should include icon", async () => {
    expect(await runPluginFromMarkdown(basic, { showIcon: true })).toBe(
      normalizeHtml(outputBasicWithIcon)
    );
  });

  it("should handle custom callout", async () => {
    expect(
      await runPluginFromMarkdown(customCallout, {
        callouts: {
          custom: {
            icon: customIcon,
            heading: "Custom default heading",
          },
        },
      })
    ).toBe(normalizeHtml(outputcustomCalloutWithIcon));
  });

  it("should handle custom callout without icon", async () => {
    expect(
      await runPluginFromMarkdown(customCallout, {
        showIcon: false,
        callouts: {
          custom: {
            icon: customIcon,
            heading: "Custom default heading",
          },
        },
      })
    ).toBe(normalizeHtml(outputcustomCallout));
  });
});
