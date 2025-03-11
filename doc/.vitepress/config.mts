import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const mermaidPlugin = withMermaid({});

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...mermaidPlugin,
  base: "/",
  title: "The OSBR Handbook",
  description: "A transparent guide to OSBR’s culture, values, and workflows.",
   head: [
    ['link', { rel: 'icon', href: 'favicon.svg', type: 'image/svg+xml'}]
   ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    logo: {
      src: '/logo1.svg', 
      alt: 'logo'
    },

    nav: [
      { text: "Home", link: "/" },
      { text: "OSBR", link: "https://www.osbrjp.com" },
    ],

    sidebar: [
      {
        text: "About",
        items: [
          { text: "What is Handbook?", link: "/what-is-handbook" },
          { text: "Strategy", link: "/strategy" },
        ],
      },
      {
        text: "People & Culture",
        items: [
          { text: "Code of Conduct", link: "/code-of-conduct" },
          { text: "Talent Acquisition", link: "/talent-acquisition" },
        ],
      },
      {
        text: "Guideline",
        items: [
          { text: "On-boarding Guide", link: "/on-boarding" },
          { text: "Development Guide", link: "/development-guide" },
          { text: "Technical Glossary", link: "/technical-glossary" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/osbr-jp/handbook" },
    ],
  },
});
