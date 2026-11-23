import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkBlog from "./src/plugins/remark-blog.mjs";
import { unified } from "@astrojs/markdown-remark";

export default defineConfig({
  site: "https://sahildesign.xyz",
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
  integrations: [
    expressiveCode({
      themes: ["github-dark-default"],
      useThemedScrollbars: false,
      styleOverrides: {
        borderRadius: "12px",
        borderColor: "#2e2e2e",
        codeFontFamily: '"Geist Mono", ui-monospace, Menlo, monospace',
        codeFontSize: "14px",
        codeLineHeight: "1.65",
        codeBackground: "#0a0a0a",
        uiFontFamily: '"Geist Mono", ui-monospace, Menlo, monospace',
        uiFontSize: "12px",
        frames: {
          editorBackground: "#0a0a0a",
          editorTabBarBackground: "#111",
          editorActiveTabBackground: "#0a0a0a",
          editorActiveTabIndicatorTopColor: "#52ff9d",
          editorActiveTabIndicatorBottomColor: "transparent",
          editorTabBarBorderBottomColor: "#2e2e2e",
          terminalBackground: "#0a0a0a",
          terminalTitlebarBackground: "#111",
          terminalTitlebarBorderBottomColor: "#2e2e2e",
          frameBoxShadowCssValue: "none",
          inlineButtonForeground: "#b0b0b0",
          inlineButtonBorder: "#545454",
          tooltipSuccessBackground: "#52ff9d",
          tooltipSuccessForeground: "#000",
        },
        textMarkers: {
          markBackground: "rgba(82, 255, 157, .09)",
          markBorderColor: "#52ff9d",
        },
      },
    }),
    mdx(),
  ],
  markdown: {
    processor: unified({
    remarkPlugins: [remarkBlog],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: "append",
        properties: { className: ["anchor"], ariaLabel: "Link to this section" },
        content: { type: "text", value: "#" },
        test: ["h2", "h3"],
      }],
    ],
    }),
  },
});
