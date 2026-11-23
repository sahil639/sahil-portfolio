// Small helpers for blog posts:
// - counts words for the reading time
// - an image alone on its line becomes <Img> (figure + caption from the "title")
// - a bare external link alone on its line becomes a <LinkCard> preview
import { visit, SKIP } from "unist-util-visit";

const SITE = "https://sahildesign.xyz";

const attr = (name, value) => ({ type: "mdxJsxAttribute", name, value });
const jsx = (name, attributes) => ({ type: "mdxJsxFlowElement", name, attributes, children: [] });

function textOf(node) {
  if (node.type === "text" || node.type === "inlineCode") return node.value;
  return (node.children || []).map(textOf).join("");
}

export default function remarkBlog() {
  return (tree, file) => {
    // Reading time
    let words = 0;
    visit(tree, ["text", "inlineCode", "code"], (n) => {
      words += (n.value.match(/\S+/g) || []).length;
    });
    const fm = (file.data.astro ??= {}).frontmatter ??= {};
    fm.minutes = Math.max(1, Math.round(words / 220));

    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || index == null) return;
      const kids = node.children.filter((c) => !(c.type === "text" && !c.value.trim()));
      if (kids.length !== 1) return;
      const only = kids[0];

      if (only.type === "image") {
        const attrs = [attr("src", only.url), attr("alt", only.alt || "")];
        if (only.title) attrs.push(attr("caption", only.title));
        parent.children[index] = jsx("Img", attrs);
        return SKIP;
      }

      if (only.type === "link" && /^https?:\/\//.test(only.url) && !only.url.startsWith(SITE)) {
        const label = textOf(only).trim();
        if (label === only.url || label === only.url.replace(/^https?:\/\//, "")) {
          parent.children[index] = jsx("LinkCard", [attr("url", only.url)]);
          return SKIP;
        }
      }
    });
  };
}
