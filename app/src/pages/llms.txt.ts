import { buildLlmsIndex } from "../lib/content/llms";
import { llmsTextEndpoint } from "../lib/content/llmsEndpoint";

// /llms.txt (llmstxt.org) — the handbook index for AI agents. ACL, caching and
// fail-closed behavior live in llmsTextEndpoint.
export const GET = llmsTextEndpoint((rows, origin) => buildLlmsIndex(rows, origin));
