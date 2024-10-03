import { visit } from "unist-util-visit";
import { isElement } from "hast-util-is-element";
import { h } from "hastscript";
import { Plugin } from "unified";
import { fromHtml } from "hast-util-from-html";

import { Config, defaultConfig } from "./config";
export { Config, defaultConfig };

const CALLOUT_REGEX =
  /\[!(?<kind>[\w]+)\](?<collapsable>-{0,1})\s*(?<title>.*)/g;

const SPLIT_BY_NEWLINE_REGEX = /(?<prefix>[^\n]*)\n(?<suffix>[\S\s]*)/g;

const getIcon = (config: Config, kind: string) => {
  if (!config.showIcon || config.callouts[kind] == undefined) return;

  return h(
    config.iconTagName,
    { className: "callout-icon-wrapper" },
    fromHtml(config.callouts[kind].icon, {
      space: "svg",
      fragment: true,
    })
  );
};

const rehypeObsidian: Plugin = (userConfig: Partial<Config>) => {
  const config = {
    ...defaultConfig,
    ...userConfig,
    callouts: {
      ...defaultConfig.callouts,
      ...userConfig?.callouts,
    },
  };

  return (tree) => {
    visit(tree, (node) => {
      /* parse only blockquote */
      if (!isElement(node, "blockquote")) return;

      // strip useless nodes, leftovers from markdown
      node.children = node.children.filter(
        (c) => !(c.type === "text" && c.value === "\n")
      );

      /* empty blockquote don't concern us */
      if (node.children.length === 0) return;

      /* the first element must be a paragraph */
      if (!isElement(node.children[0], "p")) return;

      /* empty paragraphs, etc. TODO keep this only if needed in tests */
      if (node.children[0].children.length === 0) return;

      /* ignore paragraphs that don't start with plaintext */
      if (node.children[0].children[0].type !== "text") return;

      /* finally, match the callout regex */
      if (!node.children[0].children[0].value.match(CALLOUT_REGEX)) return;

      /* the first paragraph may include `\n`, `borderingIndex` is the index of
         that element */
      let borderingIndex: number | undefined = undefined;
      node.children[0].children.forEach((c, i) => {
        if (c.type == "text" && c.value.includes("\n")) {
          borderingIndex = i;
        }
      });

      /* if the first element contains new line, split it to two new elemnts */
      if (borderingIndex !== undefined) {
        /* typecast */
        const borderingElement = node.children[0].children[borderingIndex];
        if (borderingElement.type !== "text") throw new Error();

        const nomatch = SPLIT_BY_NEWLINE_REGEX.exec(borderingElement.value);
        SPLIT_BY_NEWLINE_REGEX.lastIndex = 0; // reset the regex

        if (nomatch !== null && nomatch.groups) {
          const { prefix, suffix } = nomatch.groups;

          node.children = [
            node.children[0],
            h("p", suffix, node.children[0].children.slice(borderingIndex + 1)),
            ...node.children.slice(1),
          ];

          /* typecast */
          if (isElement(!node.children[0]) || !("children" in node.children[0]))
            throw new Error();

          node.children[0].children = node.children[0].children
            .slice(0, borderingIndex)
            .concat([{ type: "text", value: prefix }]);
        }
      }

      let firstParagraph1 = node.children[0];
      let firstTextNode = firstParagraph1.children[0];

      if (!isElement(firstParagraph1) || firstTextNode.type !== "text") return;

      const match = CALLOUT_REGEX.exec(firstTextNode.value);
      CALLOUT_REGEX.lastIndex = 0; // reset the regex

      if (!match || !match.groups) return;

      const { title, kind, collapsable } = match.groups;

      if (!node.properties) {
        node.properties = {};
      }

      node.properties.className = [
        `callout-type-${kind.toLowerCase()}`,
        "callout-block",
        collapsable && "callout-collapsible",
      ];

      node.tagName = collapsable ? "details" : "div";

      /* strip leading characters: `[!kind]- something` -> `something` */
      firstTextNode.value = firstTextNode.value.substring(
        3 + kind.length + collapsable.length
      );

      if (
        firstTextNode.value.length == 0 &&
        firstParagraph1.children.length == 1
      ) {
        // thrown away the now-empty paragraph
        node.children.shift();
      }

      if (title !== "") {
        if (!node.children[0].properties) {
          node.children[0].properties = {};
        }
        node.children[0].properties.className = ["callout-title"];
      }

      const icon =
        config.showIcon && config.callouts[kind]
          ? fromHtml(config.callouts[kind], {
              space: "svg",
              fragment: true,
            })
          : undefined;

      node.children = [
        h(
          collapsable ? "summary" : "div",
          {
            className: ["callout-title-section"],
          },
          title === ""
            ? [
                getIcon(config, kind),
                h(
                  "p",
                  { className: ["callout-title"] },
                  config.callouts[kind].heading
                    ? config.callouts[kind].heading
                    : kind.charAt(0).toUpperCase() + kind.slice(1)
                ),
              ]
            : [getIcon(config, kind), node.children[0]]
        ),
        h(
          "div",
          {
            className: ["callout-content-section"],
          },
          title === "" ? node.children : node.children.slice(1)
        ),
      ];
    });
  };
};

export default rehypeObsidian;
