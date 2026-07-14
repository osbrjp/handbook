import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import llmstxt from "vitepress-plugin-llms";

// llmstxt() generates /llms.txt + /llms-full.txt at build (llmstxt.org). It
// goes through withMermaid so it's merged with mermaid's own vite plugins.
const mermaidPlugin = withMermaid({ vite: { plugins: [llmstxt()] } });

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...mermaidPlugin,
  base: "/",
  title: "The OSBR Handbook",
  description: "A transparent guide to OSBR’s culture, values, and workflows.",
  head: [
    ["link", { rel: "icon", href: "favicon.svg", type: "image/svg+xml" }],
    // Belt-and-suspenders LLM hint for agents that read <head> (the visible
    // line in index.md is the load-bearing one; a static host can't set the
    // matching HTTP Link: header).
    ["link", { rel: "alternate", type: "text/plain", href: "/llms.txt", title: "llms.txt (machine-readable handbook index)" }],
    ["link", { rel: "alternate", type: "text/plain", href: "/llms-full.txt", title: "llms-full.txt (full handbook text for LLMs)" }],
    [
      "script",
      {
        async: "",
        src: "https://www.googletagmanager.com/gtag/js?id=G-15N43GQ2Y7",
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
          {
            text: "Development Guide",
            link: "/development-guide",
            collapsed: true,
            items: [
              {
                text: "Style Guide",
                link: "/style-guide",
                collapsed: true,
                items: [
                  { text: "TypeScript", link: "/style-guide-typescript" },
                  { text: "Golang", link: "/style-guide-golang" },
                  { text: "Python", link: "/style-guide-python" },
                  { text: "HTML & CSS", link: "/style-guide-html-css" },
                ],
              },
            ],
          },
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
