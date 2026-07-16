# AI Usage Guideline

This is how OSBR works with AI: one engineer, with AI beside them, carrying a
whole piece of work — and the standards that keep that way of working safe,
resilient, and honest. This page is the overview; each part below has a full
standard behind it.

**In depth:** [AI Data-Handling](/ai-data-handling) · [Multiple AI
Agents](/multiple-ai-agents) · [Overnight AI Operation](/overnight-ai) · [Weekly
AI Quota](/weekly-ai-quota) · [Voice Input](/voice-input) · [Policies as
Plugins](/policies-as-plugins) · [Building for AI Users](/building-for-ai-users)

[[TOC]]

## One engineer owns the whole

**One engineer owns the whole of a piece of work — and AI is what puts the whole within one person's reach.** The same person shapes the interaction, writes the code, stands up the deploy, and proves it with a test; there is no wall to toss the hard part over. When a defect lives in the seam between two layers — a design assumption that only bites at runtime, a gap only someone who holds both sides would notice — the person who found it closes it, because there is no one to hand it to. This is our **Be Strong** value made structural: own the whole seam. It holds at today's quality bar, not just today's speed, because AI supplies breadth on demand — the ops step, the missing test case, the layer you are shallow in — that used to need a second and third specialist. The AI is the multiplier; the human stays accountable for the slice and reviews the AI's cross-layer work the way they would a specialist's.

## AI is our default, bounded in writing

**AI-assisted work is our default, and its boundary is drawn in writing before the first commit.** Building with AI is how we work, not an exception a project opts into — but a default is only safe when everyone knows what may be shown to which model. Every project carries a client-agreed, version-controlled record of its data: which classes are permitted into which providers, under what configuration, and which are prohibited outright. Approved providers run under terms that exclude training on client data and hold retention to zero or near it, pinned to a known region, and the record cites each provider's own current terms as the source of truth rather than our memory of them. Secrets, credentials, and any regulated data the client has not cleared do not enter an AI service at all. If a task seems to need data or a provider the record does not cover, we stop and get the record amended — we do not proceed and hope.

## We depend on no single provider

**We depend on no single provider.** Every developer keeps at least two coding agents warm — authenticated, permissioned, pointed at the same repository — and actually exercised, because a backup nobody has run in a month is a cold spare that fails at the worst moment. Tickets, commands, and procedures are written to the task and the repository, not to one vendor's quirks, so either agent can pick them up with no rewrite. When one provider is down, throttled, or quietly regresses after a model update, the work moves to the other and continues. Because both agents are held to the same policy plugins, those plugins must stay at the same version across every agent, bumped together — divergent versions mean the same code passes on one agent and fails on the other.

## The day is for judgement, the night is for execution

**The day is for judgement; the night is for execution.** Daytime — when a human can still be asked — is spent turning fuzzy intentions into well-formed, independently runnable tickets, pre-answering the forks an agent would otherwise guess at, and setting the guardrails: what it may touch, what it must never touch, where it must stop and leave a question. The night is when agents run those tickets unattended on an isolated, reversible surface. Nothing they produce is trusted until a human has looked: every day opens by reviewing the night's work before merging or building on any of it, and by working the queue of judgement calls the agents parked rather than guessed. A ticket that produced a bad night earns a clearer specification, not a patched output. The weekly AI capacity is prepaid and perishable — unused at reset is spent and wasted — so we keep a standing backlog of genuinely valuable, non-urgent work (refactoring, security passes, research, tests and docs) to point spare capacity at, usually overnight. But utilisation is a diagnostic, never a target: we never run the meter up on valueless processing to feel productive, and when no worthwhile work remains we let the capacity lapse. Idle beats busywork.

## We speak to the AI as readily as we type

**We speak to the AI as readily as we type to it.** We think faster than we type, and voice closes that gap: we lean on dictation to get design intent, first-pass ideas, and the opening brief to an agent out of our heads and into the work, and reach for the keyboard where precision rules — short corrections, code, exact syntax, tightening our own draft. This is encouraged, never required; the room, the moment, and a person's own comfort decide, and we judge the output, never the input method.

## Our policies reach the AI too

**Our policies reach the AI, not only the humans.** Each engineering policy also ships as a plugin the agents load, so the standard is in the model's context at the moment of generation, not discovered in review after the violation is already written. Because the human page and the agent plugins are renderings of one policy, they move together: a change updates the handbook article and every agent plugin in the same pull request, or it does not merge. And a plugin that raised no objection is not proof of compliance — silence is unknown, not clean. Compliance is still earned the way it always is, through executable checks and human review; the plugin shifts the standard left into generation, it does not replace the gate on the right.

## We build for AI users too

**We build for AI users too, not only with AI.** The software we ship will be driven by both people and autonomous agents, so we treat an agent as a first-class user from the planning stage: capabilities an agent should use are exposed through machine-consumable, typed, least-privilege interfaces — a documented API or an MCP/A2A surface — never only a human GUI. And every autonomous flow keeps a human able to observe what it is doing, interpret why, interrupt it cleanly without corrupting state, and take over to finish or reverse the task. There is no level of autonomy at which a human loses that path, and the higher the stakes, the closer we sit to the human confirming each step.

## In short

- We **MUST** hold a client-agreed, version-controlled record of permitted data classes, providers, and configurations before the first commit, and stay inside it — amending and re-agreeing it rather than working around it.
- We **MUST NOT** let secrets, credentials, or uncleared regulated data enter any AI service, and **MUST** run approved providers under no-training, minimal-retention, region-pinned terms cited from the provider's own documentation.
- We **MUST** keep at least two coding agents warm and exercised, write work agent-agnostically, and keep policy plugins at the same version across all of them.
- We **MUST** review every unattended run before merging, deploying, or building on it, and work the agent's parked judgement calls rather than accept a blank cheque.
- We **MUST** update the handbook article and every agent plugin for a policy in the same pull request, and **MUST NOT** read a silent plugin as a pass — compliance is still established by checks and human review.
- We **MUST** build the observe / interpret / interrupt / take-over path into every autonomous flow, and expose agent-facing capabilities through typed, least-privilege, machine-consumable interfaces.
- We **SHOULD** spend prepaid spare capacity on real backlog value — refactoring, security, research — never on busywork to run the meter up, and **SHOULD** prefer voice for conveying intent and the keyboard for precise correction.
