import { buildLlmsFull } from "../lib/content/llms";
import { llmsTextEndpoint } from "../lib/content/llmsEndpoint";

// /llms-full.txt (llmstxt.org) — every readable page's full markdown in one
// document. ACL, caching and fail-closed behavior live in llmsTextEndpoint.
export const GET = llmsTextEndpoint((rows) => buildLlmsFull(rows));
