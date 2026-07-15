# Ethical Design Policy

The people using what we build are the people we are here to serve. That single fact settles how we design: an interface earns a choice honestly, or it does not earn it at all. This policy sets out how we keep our sign-up, consent, subscription, cancellation, and pricing flows free of deception — not as a legal chore, but because manipulating the people who trust us is a short-term win and a long-term betrayal.

[[TOC]]

## Why we design honestly

**We act in the user's genuine interest, or we have failed — even when the numbers look good.** A "dark pattern" (the industry also calls these "deceptive patterns") is any interface deliberately shaped to push someone toward a choice that serves us over them: subscribing, sharing more data, spending more, or staying enrolled, when they would decide otherwise had the choice been laid out plainly. These patterns can lift a metric this quarter. They spend down the trust that took years to build, and trust does not come back at the price it left.

**An honest interface is one a person can understand, choose freely, and reverse as easily as they made it.** That is the whole standard, and everything below is how we hold work to it. It is also a legal line in the jurisdictions we serve — deceptive consent and subscription flows are directly regulated — but we would hold it even if no regulator did.

- We **MUST** design every flow to serve the user's genuine interest, and treat a choice extracted by pressure, confusion, or guilt as a defect, not a result.
- We **MUST NOT** trade the trust of the people we serve for a short-term gain in a conversion or retention metric.

## What we do not build

**We review every interface against the known catalogue of deceptive patterns before it ships.** The catalogue is settled and public, so "is this manipulative?" is a question we can answer by inspection rather than instinct. Any match is a defect to fix, not a decision to defend. The patterns we watch for include confirmshaming (guilt-tripping the option to decline), pre-checked consent, sneaking items into a basket, forced continuity (a free trial that slides into a charge with no clear, timely warning), hard-to-cancel flows, misdirection (visual emphasis or trick wording that steers toward the choice that suits us), nagging (re-asking for a permission already declined), and hidden costs revealed only after commitment.

**We never manufacture pressure.** Urgency and scarcity cues — countdown timers, "only two left", "others are viewing" — are shown only when they are literally, verifiably true. If it is not real, it is not on the screen.

- We **MUST** walk every consent, sign-up, subscription, cancellation, and pricing flow against the deceptive-pattern catalogue before it merges, and fix every match.
- We **MUST NOT** use confirmshaming: the option to decline is stated as neutrally as the option to accept.
- We **MUST NOT** sneak items, warranties, or donations into a flow that the user did not choose, and we **MUST** disclose every cost — including what recurs and when — before the user commits.
- We **MUST** show urgency or scarcity indicators only when they are literally true and verifiable, and otherwise **MUST NOT** show them.
- We **SHOULD** meet the stricter of any two jurisdictions' rules everywhere, rather than fork an interface's honesty by region.

## Consent and symmetry

**Leaving is as easy as arriving.** Whatever it took to get in, it takes no more to get out — if sign-up is one click, so is cancellation; if a toggle turned data sharing on, the same toggle, equally prominent, turns it off. The way out gets equal visual weight, equal accessibility, and equal reach: the same number of steps, no retention maze, no phone call, no hidden menu.

**Consent is a free choice or it is nothing.** We ask for it in plain language — what we collect, why, and who receives it, in words a non-specialist reads once and understands — never buried in legalese or a linked policy. Consent controls default to off; silence and inaction are never a yes. A person can decline and still use the core product, because consent bundled with unrelated function is not freely given, and recording a coerced or pre-ticked click does not turn it into consent.

- We **MUST** make the way out of any state reachable in the same number of steps, with equal prominence and equal accessibility, as the way in.
- We **MUST** default every consent control to off, and **MUST NOT** record consent from a pre-checked or defaulted control.
- We **MUST** write consent copy in plain language that states what is collected, why, and to whom, and tie the recorded consent to the exact wording the user saw.
- We **MUST** let a user decline non-essential consent and still use the core product.
- We **SHOULD** send a clear, timely reminder before any free trial converts to a paid charge, and offer cancellation in a single step.
- We **SHOULD NOT** re-request a permission a user has already declined without a fresh, user-initiated reason.
