// Keystatic — the local blog editor at http://127.0.0.1:8765/keystatic (only while `npm run dev` runs).
// It reads and writes the same files as hand-editing: content/blog/*.mdx and public/blog/<post>/.
import { config, collection, fields } from "@keystatic/core";
import { block, wrapper, repeating } from "@keystatic/core/content-components";

const postImage = (label = "Image") =>
  fields.image({ label, directory: "public/blog", publicPath: "/blog/", validation: { isRequired: true } });

const Img = block({
  label: "Image",
  description: "Photo with optional caption and size",
  schema: {
    src: postImage(),
    alt: fields.text({ label: "Alt text (describe the image)" }),
    caption: fields.text({ label: "Caption" }),
    size: fields.select({
      label: "Size",
      options: [
        { label: "Full (text width)", value: "full" },
        { label: "Wide (wider than text)", value: "wide" },
        { label: "Inline (floats right)", value: "inline" },
      ],
      defaultValue: "full",
    }),
  },
});

export default config({
  storage: { kind: "local" },
  ui: { brand: { name: "Sahil — Blog" } },
  collections: {
    blog: collection({
      label: "Blog posts",
      path: "content/blog/*",
      slugField: "title",
      entryLayout: "content",
      format: { contentField: "content" },
      columns: ["title", "date", "draft"],
      schema: {
        title: fields.slug({ name: { label: "Title" }, slug: { label: "File name / web address" } }),
        date: fields.date({ label: "Date", defaultValue: { kind: "today" }, validation: { isRequired: true } }),
        summary: fields.text({ label: "Summary", description: "One line for the blog page and link previews", multiline: true }),
        cover: fields.image({ label: "Cover image", directory: "public/blog", publicPath: "/blog/" }),
        tags: fields.array(fields.text({ label: "Tag" }), { label: "Tags", itemLabel: (p) => p.value }),
        draft: fields.checkbox({ label: "Draft (hidden on the live site)", defaultValue: true }),
        content: fields.mdx({
          label: "Post",
          options: { image: { directory: "public/blog", publicPath: "/blog/" } },
          components: {
            Img,
            Gallery: repeating({
              label: "Gallery",
              description: "2–3 images side by side",
              children: ["Img"],
              schema: { caption: fields.text({ label: "Caption" }) },
            }),
            Callout: wrapper({
              label: "Callout",
              description: "Note, tip or warning box",
              schema: {
                type: fields.select({
                  label: "Type",
                  options: [
                    { label: "Note", value: "note" },
                    { label: "Tip", value: "tip" },
                    { label: "Warning", value: "warning" },
                  ],
                  defaultValue: "note",
                }),
                title: fields.text({ label: "Title (optional)" }),
              },
            }),
            LinkCard: block({
              label: "Link preview card",
              schema: {
                url: fields.url({ label: "URL", validation: { isRequired: true } }),
                title: fields.text({ label: "Title (optional — fetched automatically)" }),
                description: fields.text({ label: "Description (optional)" }),
              },
            }),
            YouTube: block({
              label: "YouTube video",
              schema: { id: fields.text({ label: "YouTube link", validation: { length: { min: 1 } } }) },
            }),
            Tweet: block({
              label: "Tweet / X post",
              schema: { id: fields.text({ label: "Post link", validation: { length: { min: 1 } } }) },
            }),
            Figma: block({
              label: "Figma embed",
              schema: {
                url: fields.text({ label: "Figma link", validation: { length: { min: 1 } } }),
                caption: fields.text({ label: "Caption" }),
              },
            }),
          },
        }),
      },
    }),
    sandbox: collection({
      label: "Sandbox",
      path: "content/sandbox/*",
      slugField: "title",
      format: { data: "yaml" },
      columns: ["title", "date", "kind"],
      schema: {
        title: fields.slug({ name: { label: "Title" }, slug: { label: "File name" } }),
        date: fields.date({ label: "Date", defaultValue: { kind: "today" }, validation: { isRequired: true } }),
        kind: fields.select({
          label: "Kind",
          options: [
            { label: "Interactive", value: "interactive" },
            { label: "Graphic", value: "graphic" },
          ],
          defaultValue: "interactive",
        }),
        description: fields.text({ label: "Description", multiline: true }),
        thumbnail: fields.image({ label: "Thumbnail (16:10)", directory: "public/sandbox", publicPath: "/sandbox/" }),
        href: fields.text({
          label: "Link",
          description: "Interactive piece: /sandbox/<name>/index.html (put the files in public/sandbox/<name>/). Graphic: link to the image to open it full size. Or any https:// link.",
        }),
      },
    }),
  },
});
