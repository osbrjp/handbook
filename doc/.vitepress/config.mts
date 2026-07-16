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
                  { text: "Terraform", link: "/style-guide-terraform" },
                ],
              },
              {
                text: "Design Guidelines",
                link: "/design-guidelines",
                collapsed: true,
                items: [
                  { text: "Accessibility", link: "/accessibility" },
                  { text: "Self-Explanatory UI", link: "/self-explanatory-ui" },
                  { text: "Modeless Design", link: "/modeless-design" },
                  { text: "Interaction Design", link: "/interaction-design" },
                ],
              },
              { text: "Database Guidelines", link: "/database-guidelines" },
              {
                text: "Planning & Shaping",
                link: "/development-guide#_2-4-planning-shaping",
                collapsed: true,
                items: [
                  { text: "Market Research", link: "/market-research" },
                  { text: "Requirements Modeling", link: "/requirements-modeling" },
                  { text: "Verify Before Building", link: "/verify-before-building" },
                  { text: "Cost Estimation", link: "/cost-estimation" },
                  { text: "IT Investment Evaluation", link: "/it-investment-evaluation" },
                  { text: "Legal Compliance", link: "/legal-compliance" },
                  { text: "Domain Terminology", link: "/domain-terminology" },
                  { text: "Capability over Track Record", link: "/capability-over-track-record" },
                ],
              },
              {
                text: "Quality Gate",
                link: "/quality-gate",
                collapsed: true,
                items: [
                  { text: "Testing Standards", link: "/testing-standards" },
                  { text: "Observability & Resilience", link: "/observability-resilience" },
                  { text: "Incident Management", link: "/incident-management" },
                  { text: "Code Review", link: "/code-review" },
                  { text: "CI/CD Pipeline", link: "/ci-cd-pipeline" },
                  { text: "Application Security", link: "/application-security" },
                  { text: "Access Control", link: "/access-control" },
                  { text: "Data Protection", link: "/data-protection" },
                  { text: "Supply Chain & Risk", link: "/supply-chain-risk" },
                  { text: "Architecture Standards", link: "/architecture-standards" },
                  { text: "Repository & Documentation Standards", link: "/repository-documentation-standards" },
                  { text: "API Design", link: "/api-design" },
                ],
              },
              {
                text: "AI Usage Guideline",
                link: "/ai-usage-guideline",
                collapsed: true,
                items: [
                  { text: "AI Data-Handling", link: "/ai-data-handling" },
                  { text: "Multiple AI Agents", link: "/multiple-ai-agents" },
                  { text: "Overnight AI Operation", link: "/overnight-ai" },
                  { text: "Weekly AI Quota", link: "/weekly-ai-quota" },
                  { text: "Voice Input", link: "/voice-input" },
                  { text: "Meeting Recording", link: "/meeting-recording" },
                  { text: "Policies as Plugins", link: "/policies-as-plugins" },
                  { text: "Building for AI Users", link: "/building-for-ai-users" },
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
        items: [
          { text: "SHEQ Policy", link: "/sheq-policy" },
          {
            text: "Infrastructure Planning Policy",
            link: "/infra-planning-policy",
          },
          { text: "Security Policy", link: "/security-policy" },
          { text: "Ethical Design Policy", link: "/ethical-design-policy" },
          { text: "Privacy Policy", link: "/privacy-policy" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/osbr-jp/handbook" },
    ],
  },
});
