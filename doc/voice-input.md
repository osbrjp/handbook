# Voice Input

We think faster than we type, and the gap between the two is where ideas leak
away. This page encourages **voice input** (speech-to-text / dictation) as a
first-class way of getting thought *out* of your head and into a document, a
chat, or an AI prompt — speaking closes that gap. It is an **encouragement, not
a mandate.** Speaking aloud carries real environmental and psychological costs:
an open room, a shared home, a quiet carriage, a voice that tires, a brain that
freezes the moment a microphone goes live. Those are legitimate, not excuses. We
prefer voice; we never require it.

This is where two of OSBR's values pull gently against each other, and both
hold. **Be Nice**: narrate your intent generously, so teammates and agents have
more to work with than terse notes. **Be Kind**: voice is optional *by design* —
respect the colleague who can't or won't speak aloud, and never let it become a
test of belonging. **Be Strong**: push past the small friction of hearing your
own voice; the fluency is on the other side of the awkwardness. And whichever
method someone chooses, we judge the **output** — the clarity of the intent, the
quality of the prompt — never the input method that produced it.

**Requirement levels** follow RFC 2119: **MUST** / **MUST NOT** are absolute;
**SHOULD** / **SHOULD NOT** state a strong default, overridable only with a
documented reason; **MAY** marks a free choice.

[[TOC]]

## 1. Goal

Keep the **speed of input aligned with the speed of thought.** Average sustained
typing sits around 40 words per minute; comfortable speaking runs three to four
times that. A controlled study across English and Mandarin found dictation
entered text roughly **3x faster than a keyboard** — and with *lower* error rates
after correction ([Ruan et al., 2016](https://arxiv.org/abs/1608.07323)). When
the task is to *convey* something — design intent, a half-formed idea, the first
full instruction to an AI agent — the keyboard is usually the bottleneck, not the
thinking.

Voice input also changes *how* we think, not just how fast. Externalising
reasoning as speech — the "think-aloud" habit long used in usability research
([Nielsen Norman Group, *Thinking
Aloud*](https://www.nngroup.com/articles/thinking-aloud-the-1-usability-tool/))
and familiar to engineers as rubber-duck debugging — surfaces gaps and
assumptions that stay hidden when you edit silently. Talking the problem through
*is* part of solving it.

## 2. Responsibility

| Who | Responsibility |
| --- | --- |
| **Every team member** | Try voice input for the drafting and ideation tasks below; find the tools and setup that work for you. |
| **Every team member** | Never pressure a teammate to speak aloud, and never read anything into the fact that someone types instead. |
| **Reviewers / leads** | Judge the *output* — the clarity of the intent, the quality of the prompt — never the input method used to produce it, consistent with how the [Development Guide](/development-guide) frames review. |
| **Everyone handling transcripts** | Treat recordings and transcripts with the same data-handling care as any other content — especially when they feed an AI agent as context (see the [AI Usage Guideline](/ai-usage-guideline)). |

## 3. Practices

### 3-1. Prefer voice for conveying, keyboard for correcting

**Reach for voice when the job is to *get thought out*:**

- **Design intent** — describing how a screen should feel, why a flow exists,
  what a user is really trying to do. Nuance survives better spoken than
  compressed into terse notes.
- **Brainstorming** — first-pass ideation, weighing options, thinking out loud.
  Speed and momentum matter more than polish here.
- **Initial AI instructions** — the first, full brief to an AI agent. A rich
  spoken prompt out-carries a short typed one; the agent has more to work with.
  This pairs directly with the [AI Usage Guideline](/ai-usage-guideline) — a
  fuller brief up front is a better brief.

**Reach for the keyboard when the job is precision:**

- **Short corrections and commands** — "change line 12", "rename this", "no, the
  other one". Faster and more exact typed.
- **Code, identifiers, exact syntax** — dictation mangles symbols and casing.
- **Editing your own draft** — tighten spoken text with the keyboard; voice to
  generate, keyboard to refine.

::: tip A workflow, not a rule
Speak the first draft, then read it back and fix it by keyboard. The two modes
are complements — dictate to think, type to sharpen.
:::

### 3-2. It is hands-free and easier on the body

**Voice input takes load off the hands and wrists.** For anyone managing or wary
of repetitive strain injury, dictation is a well-established way to keep
producing without the same keystroke burden ([NHS:
RSI](https://www.nhs.uk/conditions/repetitive-strain-injury-rsi/)). Even without
injury, switching modality through the day is easier on the body than hours of
continuous typing.

### 3-3. It is an accessibility path, both ways

**Speech input is a primary input modality**, not a fringe workaround, for people
for whom typing is slow, painful, or impractical — it is written into
accessibility guidance ([W3C WAI: Speech
Recognition](https://www.w3.org/WAI/perspective-videos/voice/)). Equally, some
people cannot or should not speak aloud in their environment, and the keyboard is
*their* accessible path. Supporting both modalities is the point; neither is the
"real" way to work.

### 3-4. Capture spoken discussion where it helps

**Meetings and pair sessions are already voice.** Lightweight transcription —
built-in OS dictation, [Otter.ai](https://otter.ai/), or an open model like
[OpenAI Whisper](https://github.com/openai/whisper) — turns talk into searchable
notes and feeds an AI agent context it would otherwise miss (see the [AI Usage
Guideline](/ai-usage-guideline)). Use it where it earns its keep, and keep
transcripts under the same data-handling care as any other content (§2).

## 4. MUST / SHOULD

We keep the hard rules minimal on purpose — this page leads by preference, not
compulsion.

**MUST**

- You **MUST NOT** pressure anyone to use voice input, or treat a teammate as
  less committed for typing. The choice is theirs, always.
- You **MUST** handle voice recordings and transcripts with the same
  data-handling care as any other content.

**SHOULD**

- You **SHOULD** default to voice input for conveying design intent,
  brainstorming, and initial AI instructions (§3-1) when your environment allows
  it.
- You **SHOULD** default to the keyboard for short corrections, commands, code,
  and exact syntax.
- You **SHOULD** find a voice setup that fits you, and **MAY** switch to typing
  whenever the room, the moment, or your own comfort calls for it — no
  explanation owed.

## References

- Ruan, Wobbrock, Liou, Ng, Landay — [*Comparing Speech and Keyboard Text Entry
  for Short Messages in Two Languages on Touchscreen
  Phones*](https://arxiv.org/abs/1608.07323) (2016). Dictation ~3x faster than
  typing, lower corrected error rate.
- Nielsen Norman Group — [*Thinking Aloud: The #1 Usability
  Tool*](https://www.nngroup.com/articles/thinking-aloud-the-1-usability-tool/).
  Verbalising reasoning surfaces hidden assumptions.
- W3C Web Accessibility Initiative — [*Speech Recognition (Voice) — Accessibility
  Perspectives*](https://www.w3.org/WAI/perspective-videos/voice/). Voice as a
  core accessibility modality.
- NHS — [*Repetitive Strain Injury
  (RSI)*](https://www.nhs.uk/conditions/repetitive-strain-injury-rsi/). Reducing
  keystroke load; hands-free alternatives.
- OpenAI — [*Whisper* speech-recognition
  model](https://github.com/openai/whisper); [Otter.ai](https://otter.ai/) —
  meeting transcription tooling.

**Related OSBR standards**

- [AI Usage Guideline](/ai-usage-guideline) — briefing agents; handling of
  content fed to AI.
- [Development Guide](/development-guide) — how work is reviewed, output over
  method.
