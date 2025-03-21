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
    ["link", { rel: "icon", href: "favicon.svg", type: "image/svg+xml" }],
    [
      "script",
      {
        async: "",
        src: `https://www.googletagmanager.com/gtag/js?id=${"G-15N43GQ2Y7"}`,
      },
    ],
    [
      "script",
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-15N43GQ2Y7');`,
    ],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    logo: {
      src: "/logo1.svg",
      alt: "logo",
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
          {
            text: "Non-functional Requirements",
            link: "/predefining-non-functional-requirements",
          },
          { text: "Technical Glossary", link: "/technical-glossary" },
        ],
      },
      {
        text: "Policies",
        items: [{ text: "SHEQ Policy", link: "/sheq-policy" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/osbr-jp/handbook" },
    ],
  },
});
