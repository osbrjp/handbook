import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const mermaidPlugin = withMermaid({});

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...mermaidPlugin,
  base: "/",
  title: "The OSBR Handbook",
  description: "A transparent guide to OSBR’s culture, values, and workflows.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "OSBR", link: "https://www.osbrjp.com" },
    ],

    sidebar: [
      {
        text: "About",
        items: [
          { text: "What is Handbook?", link: "/what-is-handbook" },
          { text: "Strategy Overview", link: "/strategy" },
          { text: "Code of Conduct", link: "/code-of-conduct" },
        ],
      },
      {
        text: "Guideline",
        items: [{ text: "Development Guide", link: "/development-guide" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/osbr-jp/handbook" },
    ],
  },
});
